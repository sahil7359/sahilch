/**
 * Single source of confirmed identity facts (R1: all from the interview / GitHub).
 * Nothing here is invented — see docs/interview.md for provenance.
 */
export const site = {
  name: 'Sahil Chakraborty',
  role: 'AI Engineer',
  // Honest static-hero identity line (mobile / no-JS / reduced-motion see this).
  tagline: 'AI/ML Engineer — builds production AI agents',
  location: 'Kolkata, India',
  targets: ['Bangalore', 'Delhi', 'Remote'] as const,
  email: 'help.sahil.gob@gmail.com',
  url: 'https://sahilch.vercel.app', // update if Vercel assigns a different domain

  links: {
    github: 'https://github.com/sahil7359',
    linkedin: 'https://www.linkedin.com/in/sahilch',
    youtube: 'https://www.youtube.com/@GOBGAMING',
    leetcode: 'https://leetcode.com/u/sahil7359',
    datachat: 'https://data-chat-seven.vercel.app',
  },

  handles: {
    github: 'sahil7359',
    leetcode: 'sahil7359',
  },

  // Résumé PDF lives at public/resume.pdf.
  hasResume: true,
} as const;

export type Site = typeof site;
