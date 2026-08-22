// NEXT_PUBLIC_* vars are inlined at build time and safe to read on both server and client.
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'NakamaCar Carrozzeria',
  companyPhone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? '+39 000 000 0000',
  companyEmail: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? 'info@nakamacar.it',
  companyAddress: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? 'Via Example 1, 20100 Milano (MI)',
  // Shown in the client portal's "Pagamento con bonifico" panel. Placeholder
  // values until the real bank account is provided — safe to change anytime
  // via env vars, no code change needed.
  companyIban: process.env.NEXT_PUBLIC_COMPANY_IBAN ?? 'IT00 A000 0000 0000 0000 0000 000',
  companyBankAccountHolder: process.env.NEXT_PUBLIC_COMPANY_ACCOUNT_HOLDER ?? 'NakamaCar Carrozzeria Srl',
  companyBankName: process.env.NEXT_PUBLIC_COMPANY_BANK_NAME ?? 'Banca Example S.p.A.',
};
