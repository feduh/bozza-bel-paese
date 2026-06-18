import { supabase } from "@/integrations/supabase/client";

/**
 * Calls a Supabase Edge Function via fetch (not supabase.functions.invoke),
 * so the response body is always readable and detailed error messages
 * returned by the function (e.g. "Errore di validazione: ...") are surfaced
 * instead of the generic "Edge Function returned a non-2xx status code".
 *
 * Returns `{ data, error }` where `error` is the specific message from the
 * function payload (`payload.error`) when the response is not 2xx,
 * or a network/parse error message otherwise.
 */
export async function invokeFunction<T = unknown>(
  name: string,
  body?: unknown,
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ""}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let payload: any = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { error: text };
    }

    if (!res.ok) {
      const msg =
        (payload && typeof payload.error === "string" && payload.error) ||
        (payload && typeof payload.message === "string" && payload.message) ||
        `Errore ${res.status}: ${res.statusText || "richiesta fallita"}`;
      return { data: null, error: msg, status: res.status };
    }

    if (payload && typeof payload.error === "string" && payload.error) {
      return { data: payload as T, error: payload.error, status: res.status };
    }

    return { data: payload as T, error: null, status: res.status };
  } catch (e) {
    return {
      data: null,
      error: (e as Error).message || "Errore di rete imprevisto",
      status: 0,
    };
  }
}
