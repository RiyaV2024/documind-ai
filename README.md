# DocuMind AI

A Retrieval-Augmented Generation (RAG) application built with Java, Spring Boot and Spring AI, with a simple web interface. Upload a text-based PDF, ask questions about it, and get an answer generated from the retrieved parts of that PDF, along with the file and page numbers it came from.

Everything runs locally and for free: the language models run on Ollama and the vectors are stored in PostgreSQL with pgvector.

## Screenshots

### Upload PDFs and manage them

docs/home.png

### Ask a question and see the answer with its sources

docs/answer-with-source.png

### Upload a PDF and see it in the stored list

docs/upload-success.png

### Delete asks for confirmation

docs/delete-confirm.png

### When the answer is not in the PDFs

docs/not-found.png

### A wrong file type shows a clear error

docs/upload-error.png

## Architecture

docs/architecture.png

Frontend communicates with Spring Boot REST APIs.

HTML, CSS, JavaScript → Spring Boot → PDF Processing → Embeddings (Ollama) → PostgreSQL + pgvector

### Question answering flow

User Question → Semantic Search → Relevant Chunks → Ollama (llama3.2:3b) → Answer with Sources

## Key Highlights

- Built a complete Retrieval-Augmented Generation (RAG) pipeline using Java and Spring AI
- Implemented semantic search using vector embeddings and pgvector
- Integrated local LLMs using Ollama
- Generates source-aware answers with file and page references
- Developed an end-to-end PDF ingestion and retrieval workflow
- Prevents hallucinations using similarity-threshold validation

## Why RAG

A general language model has never seen your PDF, and when it does not know something it may invent an answer. RAG fixes this by first retrieving the relevant chunks of your document, then giving only those chunks to the model as context, so the answer stays grounded in the document.

## Features

### Upload & Processing

- Upload a PDF and extract its text page by page
- Clean and split the text into chunks, keeping page number and file name as metadata

### Embeddings & Storage

- Generate embeddings for each chunk and store them in pgvector
- Re-uploading the same file replaces its old chunks instead of creating duplicates

### Semantic Search

- Finds chunks by meaning, not by exact keywords
- Uses vector similarity search for retrieval

### Question Answering

- Ask a question and receive an answer plus the sources (file name and page) it was based on
- Similarity threshold: if no chunk is similar enough, the model is not called and the API replies that the answer was not found

### Document Management

- List all stored PDFs
- Delete PDFs by file name

### Error Handling

- Clear JSON error responses through a global exception handler
- Database credentials kept out of code using environment variables

### User Interface

- Upload, list, delete and ask questions
- Expandable source references
- Loading indicators
- Light and dark themes

## Tech Stack

| Part | Technology |
|--------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 4.1.1 |
| AI toolkit | Spring AI 2.0.1 |
| Chat model | llama3.2:3b (Ollama) |
| Embedding model | nomic-embed-text (Ollama, 768 dimensions) |
| Vector database | PostgreSQL 17 + pgvector |
| Frontend | HTML, CSS and JavaScript |
| Build tool | Maven |
| API testing | Postman |

## How it Works

### 1. Upload (Ingestion)

```text
PDF
→ extract text per page
→ clean spaces
→ split into chunks
→ embeddings (nomic-embed-text)
→ store text + metadata + vector in pgvector
```

### 2. Ask (Query)

```text
Question
→ embedding
→ similarity search in pgvector (top 4, threshold 0.65)
→ build prompt (instructions + context + question)
→ llama3.2:3b
→ answer + sources
```

## Project Structure

```text
src/main
├── java/com/example/documinai
│   ├── DocuMindAiApplication.java
│   ├── controller
│   │   ├── DocumentController.java
│   │   └── GlobalExceptionHandler.java
│   ├── service
│   │   ├── PdfExtractionService.java
│   │   └── DocumentService.java
│   └── dto
│       ├── UploadResponse.java
│       ├── SearchResult.java
│       ├── AnswerResponse.java
│       ├── DocumentInfo.java
│       └── ErrorResponse.java
└── resources
    ├── application.properties
    └── static
        ├── index.html
        ├── css/style.css
        └── js/app.js
```

## Prerequisites

- Java 21 or newer
- Maven (or use the included mvnw wrapper)
- Docker Desktop
- Ollama

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/RiyaV2024/documind-ai.git
cd documind-ai
```

### 2. Pull Ollama Models

```bash
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

### 3. Create a .env File

```bash
cp .env.example .env
```

Contents:

```env
DB_USER=raguser
DB_PASSWORD=ragpass
```

### 4. Start PostgreSQL

```bash
docker compose up -d
```

### 5. Run the Application

PowerShell:

```powershell
$env:DB_USER="raguser"
$env:DB_PASSWORD="ragpass"

.\mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
export DB_USER=raguser
export DB_PASSWORD=ragpass

./mvnw spring-boot:run
```

### 6. Open the App

```text
http://localhost:8080
```

REST API:

```text
http://localhost:8080/api/documents
```

## API

Base path:

```text
/api/documents
```

| Method | Endpoint | Description |
|----------|----------|----------|
| POST | /upload | Upload a PDF |
| GET | / | List stored PDFs |
| GET | /search?question=... | Semantic search only |
| GET | /ask?question=... | Generated answer + sources |
| DELETE | /{fileName} | Delete document |

## Example

### Upload

```bash
curl -F "file=@notes.pdf" http://localhost:8080/api/documents/upload
```

### Ask

```bash
curl -G "http://localhost:8080/api/documents/ask" --data-urlencode "question=What is this report about?"
```

### List

```json
[
  {
    "fileName": "notes.pdf",
    "chunks": 3
  }
]
```

## When the Answer is Not in the PDF

If no stored chunk is similar enough to the question (similarity below the 0.65 threshold), the chat model is not called.

```json
{
  "answer": "I could not find the answer to this in the uploaded documents.",
  "sources": []
}
```

## Errors

All errors use the same shape:

```json
{
  "status": 400,
  "message": "Only PDF files are allowed."
}
```

## Configuration

| Setting | Value |
|----------|--------|
| Chunks retrieved per question | 4 |
| Similarity threshold | 0.65 |
| Embedding dimensions | 768 |
| Max upload size | 50 MB |

## Known Limitations

- Scanned PDFs are not supported
- OCR is not implemented yet
- Small local models may occasionally produce weak responses
- Language mismatch may reduce retrieval accuracy
- Search runs across all uploaded PDFs
- Files are identified by file name
- No authentication (local development setup)

## Roadmap

- Search within a selected PDF
- OCR support
- Unit tests
- Cloud deployment
- React frontend
- Authentication and authorization

## Postman Collection

A ready-made collection with all endpoints is provided in:

```text
postman/DocuMind_AI.postman_collection.json
```

Import it into Postman and start testing immediately.

## Author

Built by **Riya** as a hands-on learning project to understand:

- Retrieval-Augmented Generation (RAG)
- Semantic Search
- Vector Databases
- Spring AI
- Local LLM Integration with Ollama

GitHub: https://github.com/RiyaV2024

⭐ If you found this project useful, consider starring the repository.