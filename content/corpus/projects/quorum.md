# Quorum

## What is Quorum?
Quorum is a supervisor agent that reviews pull requests and grounds every finding in the target repository's own documentation. [README:Quorum]
It will not post anything without a human approving it first. [README:Quorum]

## How does Quorum work?
Quorum reads a pull request through the official GitHub MCP server. [README:Quorum]
A supervisor decides which specialists the diff warrants — correctness, security, and test-coverage. [README:Quorum]
Each specialist grounds its findings in retrieved chunks of the target repository's documentation using hybrid retrieval with dense vectors and BM25 fused by RRF. [README:Quorum]
Synthesis drops any finding without a resolvable citation, then the graph stops and waits for a human to approve, edit, or reject each finding. [README:Quorum]
The same capability is also published as an MCP server. [README:Quorum]

## What are Quorum's measured numbers?
Quorum's retrieval reaches NDCG@5 of 0.526 on a committed, CI-gated baseline. [README:Quorum]
Cross-encoder reranking was cut after it cost 0.079 NDCG@5 for a 63-to-91-times latency increase. [README:Quorum]
AST context-scoping reduced tokens by 34.86 percent, measured across real commits from the repository's own history. [README:Quorum]
On a 10-PR real-world golden set, trajectory-eval finding recall is 0 percent and routing recall is 100 percent. [README:Quorum]
Citation rate is 1.00 by construction, because a finding cannot exist without a resolvable citation. [README:Quorum]

## Why is Quorum's finding recall so low?
Cite-or-drop means the failure mode of a grounded reviewer is silence, on purpose. [README:Quorum]
The 0 percent finding recall is reported honestly rather than hidden, and it is the number Sahil would lead with in an interview. [README:Quorum]

## What are Quorum's known limitations?
A citation proves grounding, not aptness: a finding can cite a real chunk that does not actually support its claim. [README:Quorum]
Quorum uses a single-operator trust model with one shared token budget and no per-tenant isolation, and it has not been load-tested. [README:Quorum]

## Where is Quorum and what is its stack?
The Quorum code is on GitHub at github.com/sahil7359/Quorum. [README:Quorum]
Quorum uses Python, FastAPI, LangGraph, MCP as client and server, and Postgres with pgvector. [README:Quorum]
