# AI Architecture & RAG Pipeline - TeachStack

This document outlines the pipeline for ingestion, vector search, prompt engineering, and LLM evaluation criteria for the TeachStack platform.

---

## 1. RAG Ingestion Pipeline

To generate accurate courses and answer student questions correctly, documents must be processed systematically.

```
Raw Document (PDF/DOCX) 
   │
   ▼
Clean Text Extraction (Parser Module)
   │
   ▼
Chunking (Recursive Character Splitter)
   │ 
   ├─► Chunk Size: 1000 characters
   └─► Chunk Overlap: 200 characters
   │
   ▼
Vector Embedding (openai:text-embedding-3-small)
   │
   ├─► Model: text-embedding-3-small
   └─► Dimensions: 1536
   │
   ▼
Index Database (Qdrant Vector DB)
```

### Chunking Logic
We use a **Recursive Character Text Splitter** that splits text by characters in order: `"\n\n"`, `"\n"`, `" "`, `""`.
* **Rationale**: Maintains paragraph structures, preventing sentences from being truncated midway.
* **Metadata Attachment**: Each vector stores:
  ```json
  {
    "course_id": "UUID",
    "upload_id": "UUID",
    "page_number": 14,
    "chunk_index": 3
  }
  ```

---

## 2. Vector Index & Retrieval

* **Vector DB**: Qdrant.
* **Distance Metric**: Cosine Similarity.
* **Vector Index Filters**: We apply a hard payload filter on `course_id` for every query. This ensures user queries only retrieve from the specific course context.
  ```json
  {
    "filter": {
      "must": [
        { "key": "course_id", "match": { "value": "db71cc16-2de5-455b-b9d9-4b8ef0b3d810" } }
      ]
    }
  }
  ```

---

## 3. Prompts & LLM Orchestration

### A. Course Outline Generator Prompt
This system prompt scaffolds a hierarchical course structure.

```markdown
You are an expert curriculum developer. Generate a course syllabus outline based ONLY on the provided reference material below.
Your output must be a valid JSON object matching the schema below. Do not include any markdown format blocks outside the raw JSON.

Reference Material:
---
{CONTEXT_TEXT}
---

JSON Schema Output:
{
  "title": "Course Title",
  "description": "Short Description",
  "modules": [
    {
      "title": "Module Title",
      "order": 1,
      "lessons": [
        {
          "title": "Lesson Title",
          "learningObjectives": ["Objective 1", "Objective 2"],
          "estimatedTimeMinutes": 15
        }
      ]
    }
  ]
}
```

### B. Tutor Chat Prompt (RAG)
Used to answer user questions using semantic search results as context.

```markdown
You are "TeachStack AI Tutor", a helpful, objective, and friendly study assistant.
Analyze the conversation history and the context fragments below, and answer the student's question.

Rules:
1. Base your answer STRICTLY on the context fragments provided.
2. If the context does not contain the answer, say "I couldn't find that specific information in your course materials, but I can help you with other concepts in this course."
3. Cite your sources using bracketed page numbers or file identifiers corresponding to the metadata block in each context segment (e.g. [Source: Page 4]).

Context Segments:
---
{RETRIEVED_CHUNKS_WITH_METADATA}
---

Conversation History:
{CHAT_HISTORY}

Student Question: {QUESTION}
AI Tutor Answer:
```

---

## 4. Evaluation Strategy (Ragas Framework)

To guarantee quality, we monitor three metrics during continuous integration (CI) tests on a curated dataset:
* **Faithfulness**: Are facts in the LLM response derived strictly from the retrieved chunks? (Target: >0.90)
* **Answer Relevance**: Does the generated answer match the intent of the student's question? (Target: >0.85)
* **Context Recall**: Were all necessary facts to answer the question successfully retrieved in the top K chunks? (Target: >0.90)
