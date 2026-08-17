export type StackItem = { name: string; blurb: string; projects: string[] };

/**
 * Interviewable tier — only technologies Sahil named in Group 8 Q27 (things he'd
 * be grilled on). Blurbs are general definitions (not personal facts); the
 * project attributions come from the repo READMEs (R1-safe). Frontend is
 * deliberately absent — it is "built with AI assistance", never a claimed skill.
 */
export const interviewable: StackItem[] = [
  { name: 'LangGraph', blurb: 'Durable, checkpointed agent graphs with human-in-the-loop interrupts.', projects: ['DataChat', 'Quorum'] },
  { name: 'RAG', blurb: 'Retrieval-grounded generation — answers tied to fetched context, not model memory.', projects: ['DataChat', 'Quorum'] },
  { name: 'Hybrid retrieval', blurb: 'Dense vectors fused with BM25 via RRF, so exact tokens and semantics both rank.', projects: ['Quorum'] },
  { name: 'MCP', blurb: 'Model Context Protocol — consuming tools as a client and shipping capability as a server.', projects: ['Quorum'] },
  { name: 'pgvector', blurb: 'Vector search inside Postgres with an HNSW index, colocated with relational data.', projects: ['DataChat', 'Quorum'] },
  { name: 'Evaluation-in-CI', blurb: 'Golden-set and trajectory evals that gate every merge against a committed baseline.', projects: ['DataChat', 'Quorum'] },
  { name: 'Guardrails', blurb: 'AST checks, read-only roles, and prompt-injection defence — code, not prompts.', projects: ['DataChat', 'Quorum'] },
  { name: 'MLflow', blurb: 'Run tracing, a versioned prompt registry, and eval gating for LLM apps.', projects: ['DataChat'] },
  { name: 'FastAPI', blurb: 'Async Python APIs with Pydantic validation at the boundary and SSE streaming.', projects: ['DataChat', 'Quorum'] },
  { name: 'Python (async)', blurb: 'Typed, async Python — the language everything here is built in.', projects: ['DataChat', 'Quorum', 'FLAN-T5 Text-to-SQL'] },
  { name: 'Circuit breaker', blurb: 'Provider failover with backoff so a flaky free API degrades gracefully, never dies.', projects: ['DataChat'] },
  { name: 'Docker', blurb: 'Multi-stage images and Compose for reproducible local and deployed stacks.', projects: ['DataChat', 'Quorum'] },
  { name: 'Postgres', blurb: 'Relational store with strict constraints, RLS, and vector search in one system.', projects: ['DataChat', 'Quorum'] },
  { name: 'PEFT fine-tuning', blurb: 'Parameter-efficient fine-tuning (LoRA/QLoRA) of a base model on a narrow task.', projects: ['FLAN-T5 Text-to-SQL'] },
  { name: 'scikit-learn', blurb: 'Classical ML — models, cross-validation, and metric-honest evaluation.', projects: ['Breast Cancer Classification'] },
  { name: 'GitHub Actions', blurb: 'CI that runs lint, types, tests, security, and evals on every pull request.', projects: ['DataChat', 'Quorum'] },
];

/**
 * Familiar tier — used, but not claimed as depth (Group 8 Q28). Display-only.
 */
export const familiar: string[] = [
  'LangChain',
  'cross-encoder reranking',
  'RAGAS',
  'LangSmith / Langfuse',
  'PyTorch',
  'Hugging Face Transformers',
  'ChromaDB',
  'FAISS',
  'MySQL',
  'Jenkins CI/CD',
  'Linux / WSL2',
  'Azure',
  'llama.cpp',
];
