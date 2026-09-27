# BharatSpec AI — System Architecture

This document describes the architectural design, processing pipeline, and technology stack of **BharatSpec AI**, an AI-powered procurement specification auditor and Indian Standards recommendation engine.

---

## 1. End-to-End Processing Pipeline

The BharatSpec AI architecture follows an end-to-end dataflow pipeline that translates raw procurement requirements into structured, audited, standard-compliant technical specifications.

```
                  User
                   │
                   ▼
         React Single Page App (TypeScript + Tailwind CSS)
                   │
                   ▼
       Vite Local Dev Server / Reverse Proxy (/api -> :8001)
                   │
                   ▼
              FastAPI Backend (REST API Endpoints)
                   │
                   ▼
         Requirement Understanding & Parser
         ├── Local NLP Deterministic Parser (Regex / Entity Extraction)
         └── Google Gemini 2.0 Flash (When GEMINI_API_KEY is configured)
                   │
                   ▼
     Text Embeddings (Sentence Transformers: BAAI/bge-small-en-v1.5)
                   │
                   ▼
          FAISS Vector Search Engine (L2 / Cosine Similarity)
                   │
                   ▼
       Standards Knowledge Base (standards.json / SQLite Store)
                   │
                   ▼
    Multi-Criteria Recommendation & Role Classification Engine
    ├── Primary Equipment Standards
    ├── Subsystem Standards
    ├── Test Method & Quality Standards
    ├── Safety & Environmental Standards
    └── Installation & Commissioning Codes
                   │
                   ▼
     Procurement Specification Auditor & Gap Detection Engine
    ├── Scope & Parameter Completeness (Weighted Scoring: 0–100)
    ├── Testing & Ingress Criteria Detection
    ├── Environmental & Operating Range Compliance
    └── Version Status & Amendment Tracking
                   │
                   ▼
     Standards Relationship Graph (Nodes & Directed Edges)
                   │
                   ▼
      Interactive Frontend Dashboard & Procurement Reports
```

---

## 2. Technology Stack & Component Responsibilities

### Frontend

- **React 18**: Provides the component-based user interface, state management, and responsive views across Dashboard, Standards Explorer, Requirement Analysis, Projects, and Reports.
- **TypeScript**: Enforces strict compile-time types for domain models (specifications, standards records, audit results, graph nodes/edges).
- **Vite**: Modern frontend tooling providing instant Hot Module Replacement (HMR) and a built-in development API proxy that forwards `/api/*` traffic to the FastAPI backend at `http://127.0.0.1:8001`.
- **Tailwind CSS**: Utility-first styling framework enabling a modern full-width layout, clean data cards, interactive badges, and responsive viewports.
- **Lucide React**: Clean, accessible iconography used across navigation, status indicators, and audit score cards.

### Backend

- **FastAPI**: Asynchronous Python web framework providing high-performance RESTful API endpoints, request validation via Pydantic v2, CORS handling, and automatic OpenAPI documentation generation.
- **Uvicorn**: Lightning-fast ASGI web server implementation running the backend service.
- **SQLite**: Local relational persistence for user profiles, procurement projects, saved standards bookmarks, activity logs, and audit histories (`bharatspec.db`).
- **FAISS (`faiss-cpu`)**: Facebook AI Similarity Search library used to perform sub-millisecond nearest-neighbor search across dense vector representations of Indian Standards.
- **Sentence Transformers (`BAAI/bge-small-en-v1.5`)**: High-performance compact dense text embedding model converting natural language procurement statements and standards documents into 384-dimensional vector space.
- **Google Gemini API (`gemini-2.0-flash`)**: Configurable large language model integration used for generative requirement clarification, deep specification rewriting, and contextual explanations. When no API key is provided, the application runs in **Local Demo Mode** using local deterministic algorithms without external network calls.

---

## 3. Subsystem Breakdown

### 3.1 Requirement Understanding & Parsing (`app/services/nlp_parser.py`)
- Analyzes user-submitted natural language tender text.
- Extracts key procurement entities: core product, domain category, deployment application, environmental operating conditions, quantity, and technical parameters.
- Generates dynamic, context-aware clarifying questions when critical parameters (e.g., ingress protection, surge withstand, ambient temperature) are missing from the input text.

### 3.2 Standards Knowledge Base (`app/data/standards.json` & `app/services/standards_service.py`)
- Stores curated Indian Standards data models containing:
  - Standard Identifier (e.g., `DEMO-STD-001`, `IS 10322`, `IS 15885`)
  - Title, category, scope, and technical description
  - Normative references and related standards
  - Prescribed test methods, safety requirements, and installation codes
  - Version numbers, amendment history, and verification source metadata
- All prototype data records carry explicit `data_status: "DEMO"` tagging to ensure full transparency during evaluation.

### 3.3 Semantic Vector Search (`app/services/vector_search_service.py`)
- Standard scopes, titles, keywords, and technical descriptions are pre-embedded into vector indexes stored in `backend/vector_store/standards.index`.
- During query evaluation, incoming user requirements are embedded and matched against index vectors using cosine similarity, complemented by lexical keyword boosting.

### 3.4 Specification Auditor & Gap Detection (`app/services/specification_auditor.py`)
- Computes an objective **Readiness Score (0 to 100)** across five critical procurement dimensions:
  1. Scope and functional description completeness
  2. Technical parameters and operational thresholds
  3. Safety, insulation, and environmental protection (e.g., IP rating, surge protection)
  4. Mandatory factory acceptance tests (FAT) and type testing protocols
  5. Installation, certification, warranty, and documentation clauses
- Flags critical gaps (e.g., missing IP rating, missing surge withstand rating, missing salt spray test in coastal applications) and suggests specific replacement tender clauses.

### 3.5 Standards Relationship Graph (`app/api/routes/standards.py`)
- Models inter-standard dependencies as a directed graph consisting of typed nodes (`PRIMARY`, `SUBSYSTEM`, `TEST_METHOD`, `SAFETY`, `INSTALLATION`, `CERTIFICATION`) and typed edges (`normative_reference`, `subsystem_driver`, `test_protocol`, `safety_standard`).
- Allows procurement officers to understand why auxiliary standards must be included in a tender alongside the primary equipment standard.

---

## 4. Security & Environment Isolation

- **Zero-Hardcoded Secrets**: All API keys, database URLs, and session secrets are loaded exclusively through environment variables via Pydantic Settings (`app/core/config.py`).
- **Offline Capable**: The application does not require an internet connection or external API credentials to run in Local Demo Mode.
- **Clean Git Tracking**: Generated database files (`*.db`), temporary files, Python bytecode caches (`__pycache__`), and frontend build outputs are excluded from version control via `.gitignore`.
