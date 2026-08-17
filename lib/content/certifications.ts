export type Cert = {
  name: string;
  issuer: string;
  date: string;
  credId: string;
  verifyUrl?: string;
};

/**
 * All confirmed from LinkedIn (Group 10). Verify links are only set where the
 * URL is derivable from the credential id without guessing (Coursera pattern);
 * Microsoft / GUVI show the credential id as text rather than a fabricated link.
 */
export const certifications: Cert[] = [
  { name: 'Microsoft Certified: Fabric Data Engineer Associate', issuer: 'Microsoft', date: 'Feb 2026', credId: 'E99A9058AB1A4B93' },
  { name: 'Microsoft Certified: Azure Data Fundamentals', issuer: 'Microsoft', date: 'Dec 2025', credId: 'CD5636B3165D6A2' },
  { name: 'Generative AI: Introduction and Applications', issuer: 'IBM', date: 'Aug 2024', credId: '2HLWPEDNGHQQ', verifyUrl: 'https://coursera.org/verify/2HLWPEDNGHQQ' },
  { name: 'Generative AI: Prompt Engineering Basics', issuer: 'IBM', date: 'Aug 2024', credId: '08IQAHT9UAXN', verifyUrl: 'https://coursera.org/verify/08IQAHT9UAXN' },
  { name: 'Prompt Engineering for ChatGPT', issuer: 'Vanderbilt University', date: 'Aug 2024', credId: 'RJGE4F3649FJ', verifyUrl: 'https://coursera.org/verify/RJGE4F3649FJ' },
  { name: 'AI For India 2.0', issuer: 'HCL GUVI', date: 'Aug 2023', credId: 'B22904Du9WrQ0d1496' },
  { name: 'Python', issuer: 'HCL GUVI', date: 'Aug 2023', credId: 'B5173G6i8m610SP9U2' },
];
