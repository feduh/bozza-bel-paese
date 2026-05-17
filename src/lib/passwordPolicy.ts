import { z } from "zod";

export const PASSWORD_RULES = [
  { label: "Almeno 10 caratteri", test: (p: string) => p.length >= 10 },
  { label: "Una lettera maiuscola", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Una lettera minuscola", test: (p: string) => /[a-z]/.test(p) },
  { label: "Un numero", test: (p: string) => /[0-9]/.test(p) },
  { label: "Un simbolo", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const passwordSchema = z
  .string()
  .min(10, "Almeno 10 caratteri")
  .max(72, "Massimo 72 caratteri")
  .regex(/[A-Z]/, "Serve almeno una maiuscola")
  .regex(/[a-z]/, "Serve almeno una minuscola")
  .regex(/[0-9]/, "Serve almeno un numero")
  .regex(/[^A-Za-z0-9]/, "Serve almeno un simbolo");

export function passwordStrength(p: string): number {
  return PASSWORD_RULES.reduce((n, r) => n + (r.test(p) ? 1 : 0), 0);
}
