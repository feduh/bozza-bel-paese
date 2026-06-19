import { z } from "zod";
import type { TFunction } from "i18next";

/**
 * Centralised Zod schemas for admin forms.
 *
 * Schemas are *factories* that accept the i18n `t` function so error messages
 * stay localised (Italian, English, …) without hard-coding strings.
 *
 * Usage:
 *   const schema = realitySchema(t);
 *   const result = schema.safeParse(values);
 *   if (!result.success) setErrors(fieldErrors(result.error));
 */

// ---------- helpers ----------

/** Coerce empty strings → undefined so optional() works as expected on inputs. */
const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

/** Optional URL field that accepts empty string. */
const optionalUrl = (t: TFunction) =>
  z.preprocess(
    emptyToUndefined,
    z.string().url({ message: t("validation.url") }).optional(),
  );

const optionalEmail = (t: TFunction) =>
  z.preprocess(
    emptyToUndefined,
    z.string().email({ message: t("validation.email") }).optional(),
  );

const yearField = (t: TFunction, opts: { required?: boolean } = {}) => {
  const base = z.coerce
    .number({ invalid_type_error: t("validation.number") })
    .int(t("validation.integer"))
    .min(1000, t("validation.yearMin"))
    .max(new Date().getFullYear() + 1, t("validation.yearMax"));
  return opts.required
    ? base
    : z.preprocess(emptyToUndefined, base.optional());
};

// ---------- schemas ----------

export const realitySchema = (t: TFunction) =>
  z
    .object({
      name: z.string().trim().min(2, t("validation.nameMin")),
      type: z.enum(["con-sede", "nomade", "scomparsa"]),
      country: z.string().trim().min(2, t("validation.required")),
      city: z.string().trim().min(2, t("validation.required")),
      address: z.string().trim().min(3, t("validation.required")),
      zipCode: z.preprocess(emptyToUndefined, z.string().optional()),
      region: z.preprocess(emptyToUndefined, z.string().optional()),
      lat: z.coerce
        .number({ invalid_type_error: t("validation.coords") })
        .min(-90, t("validation.latRange"))
        .max(90, t("validation.latRange")),
      lng: z.coerce
        .number({ invalid_type_error: t("validation.coords") })
        .min(-180, t("validation.lngRange"))
        .max(180, t("validation.lngRange")),
      yearFounded: yearField(t, { required: true }),
      yearClosed: yearField(t),
      website: optionalUrl(t),
      contactEmail: optionalEmail(t),
      description: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
      history: z.preprocess(emptyToUndefined, z.string().max(5000).optional()),
      ig: optionalUrl(t),
      fb: optionalUrl(t),
      linkedin: optionalUrl(t),
      confirmedStatus: z.enum(["pendente", "confermato", "storico"]),
    })
    .refine(
      (d) => !d.yearClosed || d.yearClosed >= d.yearFounded,
      { path: ["yearClosed"], message: t("validation.yearClosedAfter") },
    );

export type RealityInput = z.infer<ReturnType<typeof realitySchema>>;

const FIGURE_CATEGORY_VALUES = [
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
] as const;

export const inviteSchema = (t: TFunction) =>
  z
    .object({
      displayName: z.string().trim().min(2, t("validation.nameMin")),
      email: z.string().trim().toLowerCase().email(t("validation.email")),
      password: z
        .string()
        .min(10, "La password deve contenere almeno 10 caratteri")
        .max(72, "La password può contenere al massimo 72 caratteri")
        .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
        .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
        .regex(/[0-9]/, "La password deve contenere almeno un numero")
        .regex(/[^A-Za-z0-9]/, "La password deve contenere almeno un simbolo"),
      role: z.enum(["author", "coordinatore"]),
      authorType: z.enum(["reality", "external", "none"]).optional(),
      realityId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
      affiliation: z.preprocess(
        emptyToUndefined,
        z.string().trim().min(2).max(120).optional(),
      ),
      memberType: z.preprocess(
        emptyToUndefined,
        z.enum(["coordinatore", "autore"]).optional(),
      ),
      // Email pubblica e categoria figura sono OBBLIGATORIE per tutte le bio
      publicEmail: z.string().trim().toLowerCase().email(t("validation.email")),
      figureCategory: z.enum(FIGURE_CATEGORY_VALUES, {
        errorMap: () => ({ message: t("validation.required") }),
      }),
      roleRealLife: z.preprocess(
        emptyToUndefined,
        z.string().trim().max(120).optional(),
      ),
      // Per i coordinatori il ruolo dentro il collettivo è obbligatorio
      roleCollective: z.preprocess(
        emptyToUndefined,
        z.string().trim().max(120).optional(),
      ),
    })
    .refine(
      (d) => d.role !== "author" || d.authorType !== "reality" || !!d.realityId,
      { path: ["realityId"], message: t("validation.required") },
    )
    .refine(
      (d) => d.role !== "author" || d.authorType !== "external" || !!d.affiliation,
      { path: ["affiliation"], message: t("validation.required") },
    )
    .refine(
      (d) => d.role !== "coordinatore" || !!d.roleCollective,
      { path: ["roleCollective"], message: t("validation.required") },
    );

export type InviteInput = z.infer<ReturnType<typeof inviteSchema>>;


// ---------- article schema ----------

export const articleSchema = (t: TFunction) =>
  z.object({
    title: z.string().trim().min(3, t("validation.required")).max(200),
    category: z.string().trim().min(2, t("validation.required")).max(300),
    excerpt: z.string().trim().min(10, t("validation.required")).max(500),
    content: z.string().trim().min(20, t("validation.required")).max(50000),
    coverImageUrl: optionalUrl(t),
  });

export type ArticleInput = z.infer<ReturnType<typeof articleSchema>>;

// ---------- error helpers ----------

export type FieldErrors = Record<string, string | undefined>;

export const fieldErrors = (err: z.ZodError): FieldErrors => {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
};
