# BharatSpec AI — REST API Reference

This document provides complete documentation for all active endpoints served by the BharatSpec AI FastAPI backend.

- **Base URL:** `http://127.0.0.1:8001`
- **Interactive Swagger UI:** `http://127.0.0.1:8001/docs`
- **OpenAPI JSON Specification:** `http://127.0.0.1:8001/openapi.json`

---

## Table of Contents

1. [System & Health](#1-system--health)
2. [Authentication](#2-authentication)
3. [Dashboard](#3-dashboard)
4. [Projects Workspace](#4-projects-workspace)
5. [Requirement Analysis & Clarification](#5-requirement-analysis--clarification)
6. [Specification Audit & Improvement](#6-specification-audit--improvement)
7. [Document Upload](#7-document-upload)
8. [Standards Knowledge Base & Graph](#8-standards-knowledge-base--graph)
9. [Reports & Exports](#9-reports--exports)
10. [Audit History](#10-audit-history)

---

## 1. System & Health

### `GET /`
- **Purpose:** Root service discovery and status.
- **Request Body:** None
- **Response Structure (200 OK):**
  ```json
  {
    "name": "BharatSpec AI API",
    "description": "AI-Powered Procurement Specification Auditor & Standards Intelligence Graph",
    "version": "1.0.0",
    "docs_url": "/docs",
    "status": "active"
  }
  ```

### `GET /api/health`
- **Purpose:** System health check and subcomponent readiness (database, FAISS vector index, Gemini configuration).
- **Request Body:** None
- **Response Structure (200 OK):**
  ```json
  {
    "status": "ok",
    "mode": "LOCAL_DEMO",
    "total_standards": 15,
    "faiss_indexed": true,
    "gemini_configured": false,
    "version": "1.0.0"
  }
  ```

---

## 2. Authentication

### `POST /api/auth/login`
- **Purpose:** Authenticate an existing user and return a bearer token.
- **Request Body:**
  ```json
  {
    "email": "officer@procurement.gov.in",
    "password": "Password123!",
    "remember_me": true
  }
  ```
- **Response Structure (200 OK):**
  ```json
  {
    "token": "demo_jwt_token_sample",
    "user": {
      "id": "usr_01",
      "name": "Procurement Officer",
      "organization": "Central Public Works Department",
      "email": "officer@procurement.gov.in",
      "created_at": "2026-09-27T10:00:00Z"
    }
  }
  ```

### `POST /api/auth/signup`
- **Purpose:** Register a new user account.
- **Request Body:**
  ```json
  {
    "name": "Engineer Sharma",
    "organization": "Smart Cities Mission",
    "email": "sharma@smartcities.gov.in",
    "password": "SecurePassword123!",
    "accept_terms": true
  }
  ```
- **Response Structure (200 OK):** Returns `AuthToken` containing the generated token and `user` profile.

### `GET /api/auth/me`
- **Purpose:** Get details of the currently authenticated user session.
- **Request Body:** None (Optional `Authorization: Bearer <token>` header)
- **Response Structure (200 OK):** Returns `UserResponse` object.

---

## 3. Dashboard

### `GET /api/dashboard`
- **Purpose:** Fetch aggregated dashboard statistics, recent activity, active projects, and items requiring procurement attention.
- **Request Body:** None
- **Response Structure (200 OK):**
  ```json
  {
    "user_name": "Procurement Officer",
    "organization": "Central Public Works Department",
    "recent_analyses": [
      {
        "id": "anl_01",
        "title": "500 LED Street Lighting Units",
        "category": "Lighting",
        "readiness_score": 82,
        "created_at": "2026-09-27T11:00:00Z"
      }
    ],
    "projects": [],
    "attention_required": [
      {
        "id": "att_01",
        "type": "missing_testing",
        "title": "Missing Salt Spray Test",
        "description": "Tender specification for outdoor lighting omits corrosion resistance criteria.",
        "analysis_id": "anl_01",
        "action_label": "Review Clause"
      }
    ],
    "stats": {
      "total_audits": 12,
      "standards_referenced": 45,
      "average_readiness": 78,
      "active_projects": 3
    }
  }
  ```

---

## 4. Projects Workspace

### `GET /api/projects`
- **Purpose:** List all procurement projects created by the user.
- **Request Body:** None
- **Response Structure (200 OK):** Array of `ProjectResponse` objects.

### `POST /api/projects`
- **Purpose:** Create a new procurement project workspace.
- **Request Body:**
  ```json
  {
    "name": "Highway LED Modernization 2026",
    "description": "Procurement of IP66 LED luminaires and automated controlgears for NH-44.",
    "department": "National Highways Authority",
    "reference": "TENDER-NHAI-2026-08"
  }
  ```
- **Response Structure (200 OK):**
  ```json
  {
    "id": "proj_12345",
    "user_id": "usr_01",
    "name": "Highway LED Modernization 2026",
    "description": "Procurement of IP66 LED luminaires...",
    "department": "National Highways Authority",
    "reference": "TENDER-NHAI-2026-08",
    "status": "In Progress",
    "readiness_score": 0,
    "requirements_count": 0,
    "standards_count": 0,
    "reports_count": 0,
    "open_issues": 0,
    "created_at": "2026-09-27T12:00:00Z",
    "updated_at": "2026-09-27T12:00:00Z",
    "items": []
  }
  ```

### `GET /api/projects/{project_id}`
- **Purpose:** Retrieve detailed project metadata including attached items and standards.
- **Request Body:** None
- **Response Structure (200 OK):** Returns single `ProjectResponse` object.

### `POST /api/projects/{project_id}/items`
- **Purpose:** Attach an analysis result, standard, report, or note to a project.
- **Request Body:**
  ```json
  {
    "item_type": "standard",
    "item_id": "DEMO-STD-001",
    "item_title": "Luminaires for Road and Street Lighting (LED)",
    "item_meta": { "category": "Lighting" }
  }
  ```
- **Response Structure (200 OK):** Returns `{ "status": "success", "item": { ... } }`.

---

## 5. Requirement Analysis & Clarification

### `POST /api/analyze`
- **Purpose:** Primary analysis engine. Parses natural language procurement text, runs vector search against Indian Standards, performs gap auditing, and generates clarifying questions.
- **Request Body:**
  ```json
  {
    "requirement": "Procurement of 500 units of energy-efficient LED street lights for municipal roads. Luminaires must be suitable for outdoor high-temperature operation with IP66 ingress protection.",
    "project_id": null,
    "category": "Lighting",
    "application": "Municipal Roadways",
    "technical_specs": "Efficacy >= 120 lm/W, THD <= 10%",
    "quantity": 500
  }
  ```
- **Response Structure (200 OK):**
  ```json
  {
    "analysis_id": "anl_7890",
    "project_id": null,
    "user_requirement": "Procurement of 500 units...",
    "structured_requirement": {
      "product": "LED Street Light",
      "category": "Lighting",
      "application": "Municipal Roadways",
      "environment": "Outdoor High-temperature",
      "quantity": 500,
      "requirements": ["Efficacy >= 120 lm/W", "THD <= 10%"],
      "keywords": ["led", "street light", "luminaire", "ip66"]
    },
    "clarifying_questions": [
      {
        "id": "q_env_rating",
        "question": "What is the specific operating atmospheric environment?",
        "context_field": "environment",
        "options": [
          { "id": "opt_1", "label": "Coastal outdoor (C4/C5 marine grade)", "value": "coastal" },
          { "id": "opt_2", "label": "Standard urban outdoor", "value": "urban" }
        ],
        "help_text": "Determines required salt spray test duration under IS standards."
      }
    ],
    "audit": {
      "readiness_score": 75,
      "overall_status": "Needs Review",
      "checklist": [
        {
          "category": "Environmental & Safety",
          "status": "Complete",
          "score": 20,
          "max_score": 20,
          "findings": "IP66 rating detected in requirement.",
          "recommendation": "Ingress rating meets standard.",
          "suggested_clauses": []
        }
      ],
      "breakdown": [],
      "critical_missing": ["Surge protection device (SPD) withstand capacity"],
      "summary_message": "Specification covers core parameters but lacks surge protection specifications."
    },
    "recommendations": [
      {
        "standard_id": "DEMO-STD-001",
        "title": "Luminaires for Road and Street Lighting (LED) — Safety & Photometric Performance",
        "category": "Lighting",
        "role_category": "PRIMARY",
        "match_score": 0.94,
        "applicability": "Primary Equipment Standard",
        "why_recommended": "Matches product type (LED street light) and outdoor roadway application.",
        "match_criteria": ["Product: LED street light", "Application: Municipal roadways", "Ingress: IP66"],
        "standard_details": { ... }
      }
    ],
    "grouped_recommendations": {
      "PRIMARY": [ ... ],
      "SUBSYSTEM": [ ... ],
      "TEST_METHOD": [ ... ]
    },
    "related_standards": [],
    "version_status": [],
    "graph": {
      "primary_id": "DEMO-STD-001",
      "nodes": [],
      "edges": []
    },
    "improved_specification": null,
    "disclaimer": "Source: Prototype Knowledge Base (Demo records for specification review)",
    "mode": "LOCAL_DEMO",
    "created_at": "2026-09-27T12:30:00Z"
  }
  ```

### `POST /api/analyze/clarify`
- **Purpose:** Re-scores the specification audit and refines standard recommendations after the user answers clarifying questions.
- **Request Body:**
  ```json
  {
    "analysis_id": "anl_7890",
    "answers": [
      {
        "question_id": "q_env_rating",
        "selected_option": "Coastal outdoor (C4/C5 marine grade)"
      }
    ]
  }
  ```
- **Response Structure (200 OK):** Returns updated `AnalyzeResponse` with recomputed readiness score and adjusted standard requirements.

---

## 6. Specification Audit & Improvement

### `POST /api/specification/audit`
- **Purpose:** Standalone audit of an arbitrary technical specification text string.
- **Request Body:**
  ```json
  {
    "text": "Supply and installation of 200 distributed solar PV rooftop modules of 540Wp capacity...",
    "category": "Solar Energy"
  }
  ```
- **Response Structure (200 OK):** Returns `SpecificationAuditResult` with checklist, score (0–100), critical missing parameters, and suggestions.

### `POST /api/specification/improve`
- **Purpose:** Generates a structured, tender-ready technical specification markdown document incorporating missing clauses and applicable Indian Standards.
- **Request Body:**
  ```json
  {
    "analysis_id": "anl_7890",
    "original_text": "500 LED street lights IP66 outdoor...",
    "standard_ids": ["DEMO-STD-001", "DEMO-STD-002", "DEMO-STD-003"]
  }
  ```
- **Response Structure (200 OK):**
  ```json
  {
    "title": "Technical Procurement Specification — LED Road Luminaires",
    "original_text": "500 LED street lights IP66 outdoor...",
    "sections": [
      {
        "title": "1. Scope & System Definition",
        "content": "This specification outlines the technical requirements...",
        "is_added": false,
        "is_modified": true
      },
      {
        "title": "4. Quality Assurance & Factory Acceptance Testing",
        "content": "Luminaires shall undergo photometric testing per DEMO-STD-003...",
        "is_added": true,
        "is_modified": false
      }
    ],
    "full_markdown": "# Technical Specification\n\n## 1. Scope...",
    "applicable_standards": ["DEMO-STD-001", "DEMO-STD-002", "DEMO-STD-003"],
    "improvements_made": [
      "Added mandatory IP66 dust and moisture test protocol",
      "Incorporated 10 kV built-in surge protection device clause",
      "Referenced electronic driver standard DEMO-STD-002"
    ]
  }
  ```

---

## 7. Document Upload

### `POST /api/documents/upload`
- **Purpose:** Uploads a procurement tender document (PDF or plaintext) to automatically extract requirements text.
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `file` (binary file upload)
- **Response Structure (200 OK):**
  ```json
  {
    "filename": "Tender_Schedule_Lighting.pdf",
    "extracted_text": "SECTION IV — TECHNICAL SPECIFICATIONS\n1. SCOPE: LED Street Lighting...",
    "character_count": 3420,
    "detected_category": "Lighting"
  }
  ```

---

## 8. Standards Knowledge Base & Graph

### `GET /api/standards`
- **Purpose:** Search and list Indian Standards from the repository database.
- **Query Parameters:**
  - `query` (optional string): Full-text or semantic search keyword
  - `category` (optional string): Filter by category (e.g. `Lighting`, `Solar Energy`, `Cables`)
  - `data_status` (optional string): Filter by status (e.g. `DEMO`)
  - `limit` (optional integer, default `20`)
  - `offset` (optional integer, default `0`)
- **Request Body:** None
- **Response Structure (200 OK):** Array of `StandardRecord` objects.

### `GET /api/standards/{standard_id}`
- **Purpose:** Fetch complete details of a specific Indian Standard by ID.
- **Request Body:** None
- **Response Structure (200 OK):** Single `StandardRecord` object.

### `GET /api/standards/{standard_id}/relationships`
- **Purpose:** Retrieve the dependency graph of related standards, drivers, test methods, and safety codes.
- **Request Body:** None
- **Response Structure (200 OK):**
  ```json
  {
    "primary_id": "DEMO-STD-001",
    "nodes": [
      {
        "id": "DEMO-STD-001",
        "label": "DEMO-STD-001",
        "title": "Luminaires for Road and Street Lighting",
        "type": "PRIMARY",
        "category": "Lighting",
        "version": "2023",
        "data_status": "DEMO"
      },
      {
        "id": "DEMO-STD-002",
        "label": "DEMO-STD-002",
        "title": "Electronic Controlgear for LED",
        "type": "SUBSYSTEM",
        "category": "Lighting Electronics",
        "version": "2022",
        "data_status": "DEMO"
      }
    ],
    "edges": [
      {
        "source": "DEMO-STD-001",
        "target": "DEMO-STD-002",
        "relationship": "subsystem_driver",
        "reason": "Luminaire requires compliant electronic LED driver controlgear"
      }
    ]
  }
  ```

### `GET /api/standards/{standard_id}/versions`
- **Purpose:** Inspect version history, revision years, amendments, and supersession state for a standard.
- **Request Body:** None
- **Response Structure (200 OK):**
  ```json
  {
    "standard_id": "DEMO-STD-001",
    "title": "Luminaires for Road and Street Lighting (LED)",
    "current_version": "2023",
    "amendments": ["Amendment 1 (2024): Elevated surge protection criteria to 10 kV"],
    "superseded_by": null,
    "status": "Current",
    "verification_source": "Prototype Knowledge Base (DEMO)"
  }
  ```

### `POST /api/standards/compare`
- **Purpose:** Side-by-side technical comparison between two or more standards.
- **Request Body:**
  ```json
  {
    "standard_ids": ["DEMO-STD-001", "DEMO-STD-002"]
  }
  ```
- **Response Structure (200 OK):** Returns `CompareStandardsResponse` containing standard details, a structured tabular matrix across technical parameters, and a summary.

### `GET /api/standards/saved`
- **Purpose:** List user's bookmarked standards.
- **Request Body:** None
- **Response Structure (200 OK):** JSON array of bookmarked standards.

### `POST /api/standards/save`
- **Purpose:** Save/bookmark a standard to user's favorites or project.
- **Request Body:**
  ```json
  {
    "standard_id": "DEMO-STD-001",
    "project_id": null,
    "notes": "Required for upcoming municipal tender"
  }
  ```
- **Response Structure (200 OK):** `{ "status": "success", "saved_id": "..." }`

### `DELETE /api/standards/saved/{saved_id_or_std_id}`
- **Purpose:** Remove a standard bookmark.
- **Request Body:** None
- **Response Structure (200 OK):** `{ "status": "success", "message": "Standard bookmark removed" }`

---

## 9. Reports & Exports

### `GET /api/reports`
- **Purpose:** Retrieve list of generated procurement reports.
- **Request Body:** None
- **Response Structure (200 OK):** JSON array of report metadata.

### `POST /api/reports/generate`
- **Purpose:** Generate a complete procurement audit report in Markdown or JSON format.
- **Request Body:**
  ```json
  {
    "analysis_id": "anl_7890",
    "project_id": null,
    "format": "JSON"
  }
  ```
- **Response Structure (200 OK):**
  ```json
  {
    "report_id": "rep_10293",
    "analysis_id": "anl_7890",
    "format": "JSON",
    "download_url": "/api/reports/rep_10293/download",
    "content": { ... }
  }
  ```

---

## 10. Audit History

### `GET /api/history`
- **Purpose:** List recent requirement analysis and audit sessions.
- **Request Body:** None
- **Response Structure (200 OK):** Array of `HistoryItem` objects.

### `GET /api/history/{analysis_id}`
- **Purpose:** Fetch complete persisted results of an earlier analysis session.
- **Request Body:** None
- **Response Structure (200 OK):** Complete `AnalyzeResponse` object.
