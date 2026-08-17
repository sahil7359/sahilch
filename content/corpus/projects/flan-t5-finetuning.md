# FLAN-T5 Text-to-SQL fine-tuning

## What is Sahil's fine-tuning project?
Sahil fine-tuned Google's FLAN-T5 with PEFT for a text-to-SQL task over ITR-6 tax filings. [interview Q23]
He built the training corpus end to end, including extraction, cleaning, and entity tagging. [interview Q23]
This was the fine-tuning work he did during the LTIMindtree internship. [interview Q23]

## Was the fine-tuning improvement measured?
The exact-match improvement over the base model was not rigorously measured, so it is reported as not measured rather than estimated. [interview Q23]

## What did the fine-tuning project use?
It used FLAN-T5, PEFT, Hugging Face Transformers, Python, and a small FastAPI service. [README:ITR6-t2sql]

## Does Sahil have fine-tuning experience?
Yes; Sahil has parameter-efficient fine-tuning experience from the FLAN-T5 text-to-SQL work. [interview Q23]
