export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rankearefaccionarias.info').replace(/\/+$/, '');

export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'ventas@rankearefaccionarias.info';

export function claimMailto(subject: string) {
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;
}
