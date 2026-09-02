# AI Customer Support Intelligence Platform

A production-oriented AI customer support platform built with **FastAPI, React, PostgreSQL, ChromaDB, Sentence Transformers, BM25, Cross-Encoder reranking, and Google Gemini**.

The system allows administrators to upload support documents and provides customers with grounded AI answers using a RAG pipeline.

---

## Features

### Authentication & Authorization

- User registration and login
- JWT authentication
- Password hashing
- Protected API routes
- Role-based access control
- Admin and Customer roles

### Knowledge Base

- Upload PDF, DOCX, and TXT documents
- File type validation
- File size validation
- Secure generated filenames
- Document status tracking
- Document listing
- Document deletion

### RAG Pipeline

```text
Document
   ↓
Text Extraction
   ↓
Text Cleaning
   ↓
Chunking
   ↓
Sentence Transformer Embeddings
   ↓
ChromaDB