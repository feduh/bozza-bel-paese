import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches display_name for the given user_ids from the profiles table.
 * Returns a map { user_id: display_name } so callers can render the live
 * author name instead of the snapshot stored on the row.
 */
export const fetchAuthorNames = async (
  userIds: Array<string | null | undefined>,
): Promise<Record<string, string>> => {
  const unique = Array.from(
    new Set(userIds.filter((u): u is string => !!u)),
  );
  if (unique.length === 0) return {};
  const { data } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", unique);
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.display_name) map[row.user_id] = row.display_name;
  }
  return map;
};

/** Resolve live name with fallback to the stored snapshot. */
export const resolveAuthorName = (
  map: Record<string, string>,
  userId: string | null | undefined,
  fallback: string,
): string => (userId && map[userId]) || fallback;
