export type TimelineItem = {
  kind: 'job' | 'education';
  role: string;
  org: string;
  period: string;
  points: string[];
  note?: string;
};

/** Most recent first. Zero invented metrics (R1) — qualitative ownership only. */
export const timeline: TimelineItem[] = [
  {
    kind: 'job',
    role: 'Platform Engineer cum Data Engineer',
    org: 'Tata Consultancy Services',
    period: 'Jul 2025 – Present',
    points: [
      'Ship features inside an enterprise GenAI/LLM framework — prompt orchestration and LLM response handling — and version production prompt templates against held-out tests.',
      'Build Python and SQL ETL with automated integration and ingestion across the billing domain, on AWS (S3, EC2, IAM).',
      'Profile source systems for lineage, quality, and PII exposure — the ingestion and redaction layer a RAG corpus needs.',
    ],
  },
  {
    kind: 'job',
    role: 'AI/ML Intern',
    org: 'LTIMindtree',
    period: 'Dec 2023 – Jan 2024',
    points: [
      'Fine-tuned FLAN-T5 with PEFT for a text-to-SQL task over ITR-6 filings; built the training corpus end to end — extraction, cleaning, entity tagging.',
    ],
  },
  {
    kind: 'education',
    role: 'B.Tech, Computer Science & Engineering',
    org: 'Kalinga Institute of Industrial Technology (KIIT), Bhubaneswar',
    period: '2021 – 2025',
    points: [],
    note: 'CGPA 8.89 / 10',
  },
];
