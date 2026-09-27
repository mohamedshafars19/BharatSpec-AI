# BharatSpec AI — Local Setup Guide

This guide details the complete process for setting up and running the BharatSpec AI procurement specification assistant locally on your development workstation.

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Python**: Version 3.10 or higher
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**: Installed and configured

---

## Repository Architecture Overview

```
BharatSpec-AI/
├── frontend/          # React 18 + Vite + Tailwind CSS + Lucide Icons
├── backend/           # FastAPI + FAISS + Sentence Transformers + SQLite
├── docs/              # Setup, Architecture, and API Documentation
├── .gitignore         # Git ignore rules
├── README.md          # Project overview and reference
└── LICENSE            # MIT License
```

> **Important**: During local development, **both the backend and frontend servers must be running concurrently** in separate terminal windows.

---

## 1. Backend Setup

The backend is built with FastAPI, SQLite, and FAISS for semantic vector retrieval. It can run in **Local Demo Mode** (fully offline with local NLP and FAISS vector matching) or **AI-Powered Mode** (using Google Gemini).

### Step 1: Open a terminal and navigate to the backend directory

```bash
cd backend
```

### Step 2: Create and activate a Python virtual environment (Recommended)

**On Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**On macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Step 3: Install backend dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### Step 4: Configure environment variables

Copy the sample environment file:

**On Windows:**
```powershell
copy .env.example .env
```

**On macOS / Linux:**
```bash
cp .env.example .env
```

Edit `.env` as needed:
```env
# Optional: Provide Google Gemini API Key for generative improvements
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

# Database path (defaults to SQLite bharatspec.db in backend root)
DATABASE_URL=sqlite:///./bharatspec.db

# Optional authentication & Hugging Face tokens
JWT_SECRET=
HF_TOKEN=
```

> **Note:** If `GEMINI_API_KEY` is omitted or left empty, BharatSpec AI automatically initializes in **Local Demo Mode** using local deterministic NLP, offline FAISS vector embeddings, and rule-based specification auditing. No paid credentials are required.

### Step 5: Start the backend server

```bash
python -m uvicorn app.main:app --port 8001
```

Or with auto-reload during development:
```bash
python -m uvicorn app.main:app --reload --port 8001
```

### Step 6: Verify backend health

- **Base URL:** [http://127.0.0.1:8001](http://127.0.0.1:8001)
- **Health Check:** [http://127.0.0.1:8001/api/health](http://127.0.0.1:8001/api/health)
- **Interactive OpenAPI Documentation:** [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

---

## 2. Frontend Setup

The frontend is a single-page application built with React 18, TypeScript, Vite, and Tailwind CSS. It communicates with the backend via Vite's local dev server proxy at `/api`.

### Step 1: Open a new terminal and navigate to the frontend directory

```bash
cd frontend
```

### Step 2: Install frontend dependencies

```bash
npm install
```

### Step 3: Configure frontend environment variables

Copy the sample environment file:

**On Windows:**
```powershell
copy .env.example .env
```

**On macOS / Linux:**
```bash
cp .env.example .env
```

The default `.env` contents:
```env
VITE_API_BASE_URL=/api
```

This points all `/api` requests to Vite's development proxy (configured in `vite.config.ts`), which automatically routes traffic to `http://127.0.0.1:8001`.

### Step 4: Start the frontend development server

```bash
npm run dev
```

### Step 5: Access the application

Open your browser and navigate to:
- **Application UI:** [http://localhost:5173](http://localhost:5173)

---

## 3. Running Optional Verification Scripts

To test that all backend API routes are responding properly:

```bash
cd backend
python scripts/verify_flow.py
```

To re-index standards embeddings using FAISS:

```bash
cd backend
python scripts/build_index.py
```

---

## Troubleshooting

### 1. `ECONNREFUSED` in browser console or terminal
- Make sure the backend server is running on `http://127.0.0.1:8001`.
- Verify that `backend/app/main.py` is listening on port `8001`.
- Check `frontend/vite.config.ts` to ensure proxy target matches `http://127.0.0.1:8001`.

### 2. Missing `faiss-cpu` or `sentence-transformers`
- If running in a minimal environment without PyTorch or FAISS, the backend gracefully falls back to deterministic keyword matching and local rule evaluation.
- To use vector search, ensure `faiss-cpu>=1.8.0` and `sentence-transformers>=3.0.0` are installed.

### 3. Port Conflicts
- If port `8001` is already in use, stop existing instances or run uvicorn on another port and update `frontend/vite.config.ts` accordingly.
