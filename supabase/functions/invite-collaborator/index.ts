import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// --- In-memory rate limiting ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 invites per minute per user

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// --- Input validation schema ---
const inviteSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email non valida")
    .max(255, "Email troppo lunga"),
  password: z
    .string()
    .min(10, "La password deve avere almeno 10 caratteri")
    .max(72, "La password può avere al massimo 72 caratteri")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
    .regex(/[0-9]/, "La password deve contenere almeno un numero")
    .regex(/[^A-Za-z0-9]/, "La password deve contenere almeno un simbolo"),
  display_name: z
    .string()
    .trim()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(100, "Il nome può avere al massimo 100 caratteri"),
  role: z.enum(["author", "coordinatore"]).default("author"),
  reality_id: z.string().uuid().nullable().optional(),
  affiliation: z.string().trim().min(2).max(120).nullable().optional(),
  member_type: z.enum(["coordinatore", "autore"]).nullable().optional(),
  public_email: z.string().trim().email("Email pubblica non valida").max(255),
  figure_category: z.enum([
    "Istituzione",
    "Università",
    "Ricercatore indipendente",
    "Curatore indipendente",
    "Artista",
    "Critico",
    "Giornalista",
    "Studente",
    "Gallerista",
    "Editore",
    "Designer",
    "Altro",
  ]),
  role_real_life: z.string().trim().max(120).nullable().optional(),
  role_collective: z.string().trim().max(120).nullable().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the calling user is admin or coordinator
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorizzato" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with caller's token to check roles
    const anonKey =
      Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
    } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Non autorizzato" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check roles: admins can invite authors and coordinators,
    // coordinators can invite authors only.
    const { data: isAdmin } = await callerClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });

    let isCoordinator = false;
    if (!isAdmin) {
      const { data: coord } = await callerClient.rpc("has_role", {
        _user_id: caller.id,
        _role: "coordinatore",
      });
      isCoordinator = !!coord;
    }

    if (!isAdmin && !isCoordinator) {
      return new Response(
        JSON.stringify({ error: "Non hai i permessi per invitare nuovi membri" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting per calling user
    if (isRateLimited(caller.id)) {
      return new Response(
        JSON.stringify({ error: "Troppi inviti. Riprova tra un minuto." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input with zod
    const rawBody = await req.json();
    const parseResult = inviteSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => e.message).join(" • ");
      return new Response(JSON.stringify({ error: `Errore di validazione: ${errors}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      email,
      password,
      display_name,
      role,
      reality_id,
      affiliation,
      member_type,
      public_email,
      figure_category,
      role_real_life,
      role_collective,
    } = parseResult.data;

    // Coordinators must specify their role in the collective
    if (role === "coordinatore" && !role_collective) {
      return new Response(
        JSON.stringify({ error: "Per i coordinatori il ruolo dentro il collettivo è obbligatorio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Coordinators can only create authors — only admins can create coordinators
    if (!isAdmin && role !== "author") {
      return new Response(
        JSON.stringify({ error: "Solo gli admin possono invitare coordinatori" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin client to create user
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create user with confirmed email
    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Business rule: coordinators belong only to the "Il Bel Paese" editorial team,
    // never to a mapped reality. Mapped realities only have authors.
    const effectiveRealityId =
      role === "author" ? reality_id ?? null : null;
    const effectiveAffiliation =
      role === "author" && !effectiveRealityId ? affiliation ?? null : null;

    // Create profile
    const { error: profileError } = await adminClient.from("profiles").insert({
      user_id: newUser.user.id,
      display_name,
      reality_id: effectiveRealityId,
      affiliation: effectiveAffiliation,
      member_type: role === "coordinatore" ? (member_type ?? "coordinatore") : "autore",
      figure_category: figure_category ?? null,
      role_real_life: role_real_life ?? null,
      role_collective: role === "coordinatore" ? role_collective ?? null : null,
      consent_public: true,
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: `Errore creazione profilo: ${profileError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Assign role
    const { error: roleError } = await adminClient.from("user_roles").insert({
      user_id: newUser.user.id,
      role,
    });

    if (roleError) {
      console.error("Role assignment error:", roleError);
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: `Errore assegnazione ruolo: ${roleError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: newUser.user.id, email: newUser.user.email },
        message: `${role === "author" ? "Autore" : "Coordinatore"} ${display_name} creato con successo`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
