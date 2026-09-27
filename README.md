# BharatSpec AI

BharatSpec AI is an AI-powered procurement specification assistant that helps users understand procurement requirements, identify applicable Indian Standards, detect specification gaps, explore related standards, review version information, and prepare improved procurement specifications.

---

## Core Workflow

BharatSpec AI guides procurement officers and engineers through a structured, intelligence-driven workflow:

```
Requirement
    │
    ▼
AI Understanding
    │
    ▼
Clarifying Questions
    │
    ▼
Specification Audit
    │
    ▼
Standards Retrieval
    │
    ▼
Related Standards
    │
    ▼
Version Review
    │
    ▼
Procurement Readiness
    │
    ▼
Improved Specification
    │
    ▼
Report
```

1. **Requirement**: The user enters raw procurement statements (e.g. *"500 energy-efficient LED street lights for municipal roads with IP66 rating"*) or uploads a tender document.
2. **AI Understanding**: The engine extracts structured procurement parameters (product, domain category, operating application, environmental thresholds, quantity).
3. **Clarifying Questions**: If critical parameters are ambiguous or missing (e.g. coastal installation, surge protection rating), dynamic clarifying questions are presented.
4. **Specification Audit**: Evaluates the requirement against technical benchmarks and computes an objective **Readiness Score (0–100)**.
5. **Standards Retrieval**: Performs dense vector search (FAISS + Sentence Transformers) to retrieve relevant Indian Standards from the knowledge base.
6. **Related Standards**: Uncovers auxiliary component standards, testing procedures, driver controlgears, and installation codes.
7. **Version Review**: Inspects revision years, amendment status, and supersession records to ensure specifications reference active standards.
8. **Procurement Readiness**: Displays category breakdowns, critical missing clauses, and readiness indicators (Ready for Tender / Needs Review / Incomplete).
9. **Improved Specification**: Automatically drafts a standardized, tender-ready technical specification with clauses, test protocols, and standard citations.
10. **Report**: Generates an audit-ready procurement compliance report exportable in JSON and Markdown formats.

---

## Features

- **Natural Language Parsing**: Identifies products, operating environments, and performance thresholds without requiring manual taxonomy navigation.
- **Contextual Clarification**: Proactively asks targeted technical questions before tender finalization.
- **Specification Gap Detection**: Pinpoints missing testing protocols, surge withstand ratings, or environmental protections.
- **FAISS Vector Search**: Sub-millisecond similarity matching against a structured knowledge base of Indian Standards.
- **Relationship Intelligence Graph**: Visualizes normative references, subsystem standards, and test methods as an interactive dependency network.
- **Version & Amendment Tracking**: Tracks standard editions, amendments, and review statuses.
- **Tender-Ready Document Generation**: Drafts structured technical specification documents with added and modified clauses highlighted.
- **Procurement Project Workspace**: Organize requirements, saved standards, and generated audit reports by project.
- **Offline / Local Demo Mode**: Full functionality available offline without external API keys via local deterministic NLP and local FAISS vector search.

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Tooling**: Vite (fast HMR dev server and `/api` reverse proxy)
- **Styling**: Tailwind CSS (modern, full-width responsive interface)
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn ASGI
- **Validation**: Pydantic v2
- **Vector Search**: FAISS (`faiss-cpu`)
- **Text Embeddings**: Sentence Transformers (`BAAI/bge-small-en-v1.5`)
- **Database**: SQLite (`bharatspec.db` via SQLAlchemy)
- **LLM Integration**: Google Gemini API (`gemini-2.0-flash` where configured, with automatic local fallback)

---

## Project Structure

```
BharatSpec-AI/
│
├── frontend/                      # React 18 + Vite Frontend
│   ├── public/                    # Static assets
│   ├── src/                       # TypeScript source code
│   │   ├── components/            # UI components (TopNavigation, cards, graphs)
│   │   ├── pages/                 # Route pages (Dashboard, Analyze, Standards, etc.)
│   │   ├── services/              # API client services
│   │   └── types/                 # TypeScript interfaces
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts             # Vite configuration with /api backend proxy
│   ├── tsconfig.json
│   └── .env.example               # Frontend environment template
│
├── backend/                       # FastAPI Backend
│   ├── app/
│   │   ├── api/                   # REST API route handlers
│   │   ├── core/                  # Application configuration & settings
│   │   ├── database/              # SQLite database schema and connection
│   │   ├── models/                # Pydantic domain schemas
│   │   ├── services/              # Core business logic (NLP, audit, FAISS, Gemini)
│   │   ├── vector_store/          # Vector indexing utilities
│   │   └── main.py                # FastAPI entry point
│   │
│   ├── data/
│   │   └── standards.json         # Standards knowledge base dataset
│   │
│   ├── scripts/                   # Indexing and verification scripts
│   ├── vector_store/              # Pre-computed FAISS index and metadata
│   ├── requirements.txt           # Python backend dependencies
│   └── .env.example               # Backend environment template
│
├── docs/                          # Comprehensive Documentation
│   ├── architecture.md            # Architecture diagram and pipeline details
│   ├── setup.md                   # Step-by-step local execution guide
│   └── api.md                     # Complete REST API reference
│
├── .gitignore                     # Git ignore rules
├── README.md                      # Project documentation
└── LICENSE                        # MIT License
```

---

## Local Setup

> **Note:** During local development, **both the backend and frontend servers must be running concurrently** in separate terminals.

Detailed setup instructions are available in [docs/setup.md](docs/setup.md).

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv .venv

# On Windows:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
# source .venv/bin/activate

# Install dependencies
python -m pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --port 8001
```

Backend URL: `http://127.0.0.1:8001`  
API Documentation (Swagger): `http://127.0.0.1:8001/docs`

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## Environment Variables

### Frontend (`frontend/.env.example`)

```env
VITE_API_BASE_URL=/api
```

### Backend (`backend/.env.example`)

```env
GEMINI_API_KEY=
GEMINI_MODEL=
DATABASE_URL=
JWT_SECRET=
HF_TOKEN=
```

> **Security Note:** Never commit actual API keys or secret credentials to version control. When `GEMINI_API_KEY` is not provided, BharatSpec AI automatically runs in **Local Demo Mode** using deterministic NLP and offline vector search.

---

## API Overview

A complete endpoint reference is available in [docs/api.md](docs/api.md).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, mode, and index status |
| `POST` | `/api/analyze` | Parse requirement, vector search, and audit |
| `POST` | `/api/analyze/clarify` | Submit clarification answers and re-score |
| `POST` | `/api/specification/audit` | Standalone specification readiness scoring |
| `POST` | `/api/specification/improve` | Generate improved specification draft |
| `GET` | `/api/standards` | Search and filter standards knowledge base |
| `GET` | `/api/standards/{id}` | Retrieve standard details and requirements |
| `GET` | `/api/standards/{id}/relationships` | Retrieve dependency graph nodes and edges |
| `GET` | `/api/standards/{id}/versions` | Inspect amendments and version history |
| `POST` | `/api/standards/compare` | Compare multiple standards side-by-side |
| `GET` | `/api/dashboard` | Dashboard metrics and attention items |
| `GET` | `/api/projects` | List procurement projects |
| `POST` | `/api/projects` | Create a new procurement project |
| `GET` | `/api/history` | View past analysis sessions |
| `POST` | `/api/reports/generate` | Generate compliance report export |

---

## Data and Source Status

- **Prototype Knowledge Base**: Standards data used in this application are stored in `backend/data/standards.json`.
- **Demo Records Transparency**: Prototype records are designated with `DEMO` identifiers (e.g. `DEMO-STD-001`, `DEMO-STD-002`) and explicit `"data_status": "DEMO"` metadata.
- **Traceability**: All recommendations clearly cite their data source, cataloged version, and amendment records.
- **No False Claims**: BharatSpec AI is a demonstration prototype designed for procurement specification review. It is not an official portal of the Bureau of Indian Standards (BIS) or the Government of India. Official procurement tenders must always verify current standards via the official BIS portal (manakonline.in).

---

## Development Notes

- **Vite Proxy**: The frontend uses Vite's proxy configuration in `frontend/vite.config.ts` to redirect `/api` requests to `http://127.0.0.1:8001`, preventing CORS issues during local development.
- **Offline Indexing**: To regenerate the FAISS index from `standards.json`, run `python backend/scripts/build_index.py`.
- **API Verification**: Run `python backend/scripts/verify_flow.py` to test all backend routes.

---

## Limitations

- **Demo Dataset Scope**: The prototype database contains a curated set of demonstration standards across representative engineering domains (Lighting, Solar, Cables, Transformers, Switchgear). It does not encompass the full catalogue of 20,000+ Indian Standards.
- **Advisory Only**: Generated specifications and readiness scores serve as decision-support guidance for procurement officers and should be reviewed by qualified technical authorities prior to tender publication.
- **AI Assist Mode**: When operating with external LLMs, responses are bound by the provided context and ground-truth standards knowledge base to prevent hallucinations.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
