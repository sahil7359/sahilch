# ITR-6 Text-to-SQL

## What is the ITR-6 Text-to-SQL project?
It lets a user query Indian corporate tax filings, ITR-6, in plain English. [README:ITR6-t2sql]
ITR-6 maps 129 statutory line items to columns whose names are legal vocabulary, so a phrase like "staff welfare" has to reach a column such as WORKMEN_EXPENSES with nothing in the phrase to bridge them. [README:ITR6-t2sql]

## What is the real engineering in ITR-6 Text-to-SQL?
The safety layer is the real engineering, not the SQL generation. [README:ITR6-t2sql]
A model inventing a column name is the default failure mode of text-to-SQL, and generating a query and running it blindly is how a demo becomes an incident. [README:ITR6-t2sql]

## How is a query kept safe in ITR-6 Text-to-SQL?
Every query clears two independent gates. [README:ITR6-t2sql]
First a static read-only guard: SELECT-only, no stacked statements, schema-checked, LIMIT enforced, and string literals are stripped first so a company named "Drop Anchor Ltd" does not trip the DROP rule. [README:ITR6-t2sql]
Then SQLite's own EXPLAIN as the authoritative check, because a regex can always be argued with and a parser cannot. [README:ITR6-t2sql]

## Does ITR-6 Text-to-SQL need an API key?
No. It runs with no API key: an LLM backend when one is configured, and a curated offline matcher otherwise that refuses below a confidence threshold rather than guessing. [README:ITR6-t2sql]
A demo that dies on an expired key is worse than one that degrades predictably. [README:ITR6-t2sql]

## Is the data in ITR-6 Text-to-SQL real?
No. All financial data is synthetic; the project demonstrates the safety architecture, not a production tax tool. [README:ITR6-t2sql]

## What is the stack for ITR-6 Text-to-SQL, and where is it?
It is built in Python with SQLite, Groq, and Streamlit, with 55 tests, and CI runs without credentials on purpose. [README:ITR6-t2sql]
The code is at github.com/sahil7359/ITR6-t2sql and a live demo is at itr6-t2sql.streamlit.app. [README:ITR6-t2sql]
