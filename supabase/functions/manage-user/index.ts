import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type AppRole = "admin" | "moderator" | "collaborator" | "author";
const ALL_ROLES: AppRole[] = ["admin", "moderator", "collaborator", "author"];

const opSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("list_users") }),
  z.object({
    op: z.literal("update_roles"),
    user_id: z.string().uuid(),
    roles: z.array(z.enum(["admin", "moderator", "collaborator", "author"])),
  }),
  z.object({
    op: z.literal("reset_password"),
    user_id: z.string().uuid(),
    new_password: z
      .string()
      .min(10, "Almeno 10 caratteri")
      .max(72)
      .regex(/[A-Z]/, "Serve almeno una maiuscola")
      .regex(/[a-z]/, "Serve almeno una minuscola")
      .regex(/[0-9]/, "Serve almeno un numero")
      .regex(/[^A-Za-z0-9]/, "Serve almeno un simbolo"),
  }),
  z.object({
    op: z.literal("set_banned"),
    user_id: z.string().uuid(),
    banned: z.boolean(),
  }),
  z.object({
    op: z.literal("delete_user"),
    user_id: z.string().uuid(),
  }),
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Non autorizzato" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const callerClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user: caller },
    } = await callerClient.auth.getUser();
    if (!caller) return json({ error: "Non autorizzato" }, 401);

    const { data: isAdmin } = await callerClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Solo gli admin possono gestire gli utenti" }, 403);

    const raw = await req.json();
    const parsed = opSchema.safeParse(raw);
    if (!parsed.success) {
      return json({ error: parsed.error.errors.map((e) => e.message).join(", ") }, 400);
    }
    const data = parsed.data;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ---------- LIST USERS ----------
    if (data.op === "list_users") {
      const { data: usersResp, error: usersErr } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (usersErr) return json({ error: usersErr.message }, 500);

      const ids = usersResp.users.map((u) => u.id);
      const [{ data: profs }, { data: roles }] = await Promise.all([
        admin.from("profiles").select("user_id, display_name, avatar_url, member_type, reality_id, affiliation, public_email").in("user_id", ids),
        admin.from("user_roles").select("user_id, role").in("user_id", ids),
      ]);

      const profileMap = new Map((profs ?? []).map((p) => [p.user_id, p]));
      const roleMap = new Map<string, AppRole[]>();
      for (const r of roles ?? []) {
        const list = roleMap.get(r.user_id) ?? [];
        list.push(r.role as AppRole);
        roleMap.set(r.user_id, list);
      }

      const users = usersResp.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        banned_until: (u as { banned_until?: string | null }).banned_until ?? null,
        profile: profileMap.get(u.id) ?? null,
        roles: roleMap.get(u.id) ?? [],
      }));
      return json({ users });
    }

    // Self-protection: caller can't act on themselves for risky ops
    const isSelf = data.user_id === caller.id;

    // ---------- UPDATE ROLES ----------
    if (data.op === "update_roles") {
      if (isSelf && !data.roles.includes("admin")) {
        return json({ error: "Non puoi rimuovere il tuo ruolo admin." }, 400);
      }
      const desired = new Set(data.roles);
      const { data: current } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user_id);
      const currentSet = new Set((current ?? []).map((r) => r.role as AppRole));

      const toAdd = [...desired].filter((r) => !currentSet.has(r));
      const toRemove = [...currentSet].filter((r) => !desired.has(r));

      if (toAdd.length) {
        const { error } = await admin
          .from("user_roles")
          .insert(toAdd.map((role) => ({ user_id: data.user_id, role })));
        if (error) return json({ error: error.message }, 500);
      }
      if (toRemove.length) {
        const { error } = await admin
          .from("user_roles")
          .delete()
          .eq("user_id", data.user_id)
          .in("role", toRemove);
        if (error) return json({ error: error.message }, 500);
      }
      return json({ ok: true });
    }

    // ---------- RESET PASSWORD ----------
    if (data.op === "reset_password") {
      const { error } = await admin.auth.admin.updateUserById(data.user_id, {
        password: data.new_password,
      });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    // ---------- BAN / UNBAN ----------
    if (data.op === "set_banned") {
      if (isSelf) return json({ error: "Non puoi sospendere il tuo account." }, 400);
      const { error } = await admin.auth.admin.updateUserById(data.user_id, {
        ban_duration: data.banned ? "876000h" : "none", // ~100 anni o sblocca
      });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    // ---------- DELETE (SOFT) ----------
    if (data.op === "delete_user") {
      if (isSelf) return json({ error: "Non puoi eliminare il tuo account." }, 400);
      // 1. Anonimizza il profilo (mantiene articoli)
      await admin
        .from("profiles")
        .update({
          display_name: "Utente rimosso",
          bio: "",
          avatar_url: null,
          website: null,
          social_instagram: null,
          social_twitter: null,
          social_linkedin: null,
          public_email: null,
          consent_public: false,
          affiliation: null,
          role_collective: null,
          role_real_life: null,
          figure_category: null,
          reality_id: null,
        })
        .eq("user_id", data.user_id);
      // 2. Rimuovi tutti i ruoli
      await admin.from("user_roles").delete().eq("user_id", data.user_id);
      // 3. Banna l'account così non può più loggarsi
      await admin.auth.admin.updateUserById(data.user_id, { ban_duration: "876000h" });
      return json({ ok: true });
    }

    return json({ error: "Operazione sconosciuta" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
