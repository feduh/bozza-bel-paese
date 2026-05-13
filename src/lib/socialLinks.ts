/** Costruisce la stringa social_links replicando la logica del foglio Google. */
export const buildSocialLinks = (links: {
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
}): string => {
  const parts: string[] = [];
  if (links.instagram) parts.push(`Instagram:${links.instagram}`);
  if (links.facebook) parts.push(`Facebook:${links.facebook}`);
  if (links.twitter) parts.push(`Twitter:${links.twitter}`);
  if (links.linkedin) parts.push(`LinkedIn:${links.linkedin}`);
  return parts.join(" | ");
};
