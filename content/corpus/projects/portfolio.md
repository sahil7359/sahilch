# This website

## How was this website built?
This website is a Next.js 16 application using the App Router and React Server Components. [site]
It uses Tailwind CSS v4 with design tokens, a hand-rolled canvas hero, and Lenis for smooth scrolling. [site]
The frontend was built with AI assistance. [site]

## How does the chat agent on this site work?
The chat agent is a retrieval-augmented system over a small corpus about Sahil. [site]
It uses hybrid retrieval — pgvector dense search fused with Postgres full-text search using reciprocal rank fusion, then MMR to diversify results. [site]
It has four independent guardrail layers: a pre-filter, a semantic cache, a strict relevance gate, and a post-generation check. [site]
If retrieval is not confident, the agent refuses rather than guessing. [site]

## What model does the chat agent use?
The chat agent uses Groq for streaming generation and a hosted embedding model for retrieval. [site]

## Why did Sahil build a chat agent when DataChat and Quorum are also retrieval systems?
This site agent and Quorum solve the same retrieval problem under opposite constraints. [site]
This site agent optimises for refusal correctness over answer coverage, because the cost of a fabricated career fact is high. [site]
Its relevance gate is deliberately strict, refusing some answerable questions on purpose. [site]

## Where is the code for this website?
The code for this portfolio is on Sahil's GitHub. [site]

## Is this website expensive to run?
This website runs on free infrastructure tiers with hard usage ceilings. [site]
