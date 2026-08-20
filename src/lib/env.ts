// NEXT_PUBLIC_* vars are inlined at build time and safe to read on both server and client.
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'NakamaCar Carrozzeria',
  companyPhone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? '+39 000 000 0000',
  companyEmail: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? 'info@nakamacar.it',
  companyAddress: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? 'Via Example 1, 20100 Milano (MI)',
};
