# DataChat

## What is DataChat?
DataChat is an agentic natural-language analytics platform over public datasets. [README:DataChat]
A user asks a question in plain English and gets safe, verified SQL, a grounded answer, and a chart. [README:DataChat]
It is built as a real LangGraph agent that plans, retrieves schema, generates SQL, guardrails it, optionally pauses for human approval, executes, verifies, self-repairs, explains, and visualizes. [README:DataChat]

## How is DataChat kept safe?
Generated SQL passes an AST guardrail chain and runs on a read-only, least-privilege database role, so no unsafe query can execute. [README:DataChat]
Retrieval grounds the model in the database schema through pgvector, so the model does not invent column names. [README:DataChat]

## What are DataChat's measured results?
On a 26-case golden set of 21 answerable and 5 refusal cases, measured with Groq llama-3.3-70b at temperature 0, DataChat reached execution accuracy 0.810. [README:DataChat]
It reached refusal accuracy 1.00 on the out-of-scope cases. [README:DataChat]
It reached an SQL valid rate of 0.952 and explanation faithfulness of 0.905. [README:DataChat]
A self-hosted 7B model scored 0.667 execution accuracy on the same set, a measured 14-point gap. [README:DataChat]

## How does DataChat handle model providers?
DataChat uses a provider circuit breaker with Groq as the deployed model and Gemini as a fallback, and a self-hosted Ollama model is swappable behind the same interface. [README:DataChat]
Every run is traced in MLflow with a versioned prompt registry. [README:DataChat]

## What is DataChat's evaluation approach?
A deterministic pipeline evaluation gates every pull request, and the model-quality number is measured separately against a committed baseline. [README:DataChat]
Execution accuracy uses strict result-set equality, which undercounts some correct answers; the strict number is published anyway. [README:DataChat]

## Is DataChat live and where is the code?
DataChat is live at data-chat-seven.vercel.app. [README:DataChat]
The code is on GitHub at github.com/sahil7359/DataChat. [README:DataChat]

## What is DataChat's stack?
DataChat uses LangGraph, FastAPI, Pydantic v2, SQLAlchemy 2, Postgres with pgvector, Redis, MLflow, and Groq. [README:DataChat]

## What are DataChat's known limitations?
Retrieval is over four tables, so it is not a hard retrieval problem and NDCG-style numbers would be meaningless at that size. [README:DataChat]
The evaluation covers single-turn natural-language-to-SQL only, not multi-turn conversation, the human-approval path, chart correctness, or latency. [README:DataChat]
