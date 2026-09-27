import sqlite3
import json
import uuid
import datetime
import logging
from typing import List, Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_connection():
    conn = sqlite3.connect(settings.DATABASE_URL, timeout=30.0)
    try:
        conn.execute("PRAGMA journal_mode=WAL")
    except Exception:
        pass
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Users
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            organization TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 2. Projects
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            department TEXT DEFAULT '',
            reference TEXT DEFAULT '',
            status TEXT DEFAULT 'Active',
            readiness_score INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("PRAGMA table_info(projects)")
    proj_cols = {col[1] for col in cursor.fetchall()}
    if "department" not in proj_cols:
        cursor.execute("ALTER TABLE projects ADD COLUMN department TEXT DEFAULT ''")
    if "reference" not in proj_cols:
        cursor.execute("ALTER TABLE projects ADD COLUMN reference TEXT DEFAULT ''")

    # 3. Project Items (links analyses, standards, notes)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_items (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            item_type TEXT NOT NULL,
            item_id TEXT NOT NULL,
            item_title TEXT NOT NULL,
            item_meta TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    """)

    # 4. Analyses
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            user_requirement TEXT NOT NULL,
            structured_requirement TEXT NOT NULL,
            clarifications TEXT,
            gaps TEXT,
            readiness_score INTEGER DEFAULT 65,
            improved_spec TEXT,
            category TEXT,
            status TEXT DEFAULT 'Needs Review',
            mode TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Auto-migrate any columns if analyses existed previously
    cursor.execute("PRAGMA table_info(analyses)")
    existing_cols = {col[1] for col in cursor.fetchall()}
    if "readiness_score" not in existing_cols:
        cursor.execute("ALTER TABLE analyses ADD COLUMN readiness_score INTEGER DEFAULT 65")
    if "gaps" not in existing_cols:
        cursor.execute("ALTER TABLE analyses ADD COLUMN gaps TEXT")
    if "clarifications" not in existing_cols:
        cursor.execute("ALTER TABLE analyses ADD COLUMN clarifications TEXT")
    if "improved_spec" not in existing_cols:
        cursor.execute("ALTER TABLE analyses ADD COLUMN improved_spec TEXT")
    if "status" not in existing_cols:
        cursor.execute("ALTER TABLE analyses ADD COLUMN status TEXT DEFAULT 'Needs Review'")
    if "project_id" not in existing_cols:
        cursor.execute("ALTER TABLE analyses ADD COLUMN project_id TEXT")
    
    # 5. Recommendations
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendations (
            id TEXT PRIMARY KEY,
            analysis_id TEXT NOT NULL,
            standard_id TEXT NOT NULL,
            title TEXT NOT NULL,
            role_category TEXT DEFAULT 'PRIMARY',
            match_score REAL,
            applicability TEXT,
            why_recommended TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (analysis_id) REFERENCES analyses(id)
        )
    """)

    cursor.execute("PRAGMA table_info(recommendations)")
    rec_cols = {col[1] for col in cursor.fetchall()}
    if "role_category" not in rec_cols:
        cursor.execute("ALTER TABLE recommendations ADD COLUMN role_category TEXT DEFAULT 'PRIMARY'")

    # 6. Saved Standards / Bookmarks
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS saved_standards (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            project_id TEXT,
            standard_id TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 7. Reports
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            project_id TEXT,
            analysis_id TEXT,
            title TEXT NOT NULL,
            format TEXT DEFAULT 'JSON',
            content_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 8. Activity Logs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            project_id TEXT,
            action TEXT NOT NULL,
            details TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()

    # Pre-seed initial default data if users table is empty
    _seed_initial_data(cursor, conn)

    conn.close()
    logger.info("Database schema initialized with real procurement entities.")

def _seed_initial_data(cursor, conn):
    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()["count"] == 0:
        logger.info("Seeding realistic procurement workspace projects and user...")
        default_user_id = "USR-GOV-001"
        cursor.execute(
            """
            INSERT INTO users (id, name, organization, email, password_hash)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                default_user_id,
                "Mohamed Shafar",
                "Directorate of Municipal Infrastructure Procurement",
                "procurement@gov.in",
                "pbkdf2:demo_password"
            )
        )

        # Seed 3 realistic projects
        projects_data = [
            (
                "PRJ-001",
                default_user_id,
                "Municipal Street Lighting Procurement",
                "LED roadway luminaires, constant-current drivers, surge protection, and pole-mounting hardware for urban smart road project.",
                "In Review",
                74
            ),
            (
                "PRJ-002",
                default_user_id,
                "Secretariat Office Furniture & Seating",
                "Ergonomic mesh chairs, Class-4 pneumatic gas lifts, modular workstations, and CRCA steel storage almirahs for administrative secretariat.",
                "Specification Complete",
                92
            ),
            (
                "PRJ-003",
                default_user_id,
                "Substation Distribution Infrastructure",
                "11kV/433V oil-immersed distribution transformers, XLPE armoured power cables, and HT switchgear units.",
                "Needs Attention",
                58
            )
        ]

        for p in projects_data:
            cursor.execute(
                """
                INSERT INTO projects (id, user_id, name, description, status, readiness_score)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                p
            )

        # Seed activity logs
        activities = [
            ("ACT-1", default_user_id, "PRJ-001", "Specification Audit Run", "Analyzed 500 LED street lights tender specification; identified missing testing protocol."),
            ("ACT-2", default_user_id, "PRJ-001", "Standard Saved", "Saved DEMO-STD-001 (Road & Street Luminaires) to project workspace."),
            ("ACT-3", default_user_id, "PRJ-002", "Specification Finalized", "Generated formal 9-section improved procurement specification schedule.")
        ]
        for a in activities:
            cursor.execute(
                """
                INSERT INTO activity_logs (id, user_id, project_id, action, details)
                VALUES (?, ?, ?, ?, ?)
                """,
                a
            )

        conn.commit()

# --- User Auth Operations ---
def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_user(name: str, organization: str, email: str, password_hash: str) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    user_id = f"USR-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute(
        """
        INSERT INTO users (id, name, organization, email, password_hash)
        VALUES (?, ?, ?, ?, ?)
        """,
        (user_id, name, organization, email.strip().lower(), password_hash)
    )
    conn.commit()
    conn.close()
    return {
        "id": user_id,
        "name": name,
        "organization": organization,
        "email": email.strip().lower(),
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

# --- Project Operations ---
def get_projects(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    query = """
        SELECT p.*,
            (SELECT COUNT(*) FROM project_items WHERE project_id = p.id AND item_type = 'analysis') as requirements_count,
            (SELECT COUNT(*) FROM project_items WHERE project_id = p.id AND item_type = 'standard') as standards_count,
            (SELECT COUNT(*) FROM project_items WHERE project_id = p.id AND item_type = 'report') as reports_count
        FROM projects p
        ORDER BY p.updated_at DESC
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    result = []
    for r in rows:
        d = dict(r)
        d["open_issues"] = 2 if d["readiness_score"] < 80 else 0
        result.append(d)
    conn.close()
    return result

def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    project = dict(row)
    
    # Get items
    cursor.execute("SELECT * FROM project_items WHERE project_id = ? ORDER BY created_at DESC", (project_id,))
    items = [dict(it) for it in cursor.fetchall()]
    project["items"] = items
    project["open_issues"] = 2 if project["readiness_score"] < 80 else 0
    project["requirements_count"] = sum(1 for it in items if it["item_type"] == "analysis")
    project["standards_count"] = sum(1 for it in items if it["item_type"] == "standard")
    project["reports_count"] = sum(1 for it in items if it["item_type"] == "report")
    
    conn.close()
    return project

def create_project(user_id: str, name: str, description: str = "", department: str = "", reference: str = "") -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    p_id = f"PRJ-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute(
        """
        INSERT INTO projects (id, user_id, name, description, department, reference, status, readiness_score)
        VALUES (?, ?, ?, ?, ?, ?, 'Active', 60)
        """,
        (p_id, user_id, name, description, department, reference)
    )
    conn.commit()
    conn.close()
    return get_project_by_id(p_id)

def add_item_to_project(project_id: str, item_type: str, item_id: str, item_title: str, item_meta: Optional[dict] = None):
    conn = get_connection()
    cursor = conn.cursor()
    it_id = f"ITM-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute(
        """
        INSERT INTO project_items (id, project_id, item_type, item_id, item_title, item_meta)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (it_id, project_id, item_type, item_id, item_title, json.dumps(item_meta) if item_meta else None)
    )
    cursor.execute("UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()

# --- Analyses Operations ---
def save_analysis(
    analysis_id: str,
    user_requirement: str,
    structured_requirement: dict,
    category: str,
    mode: str,
    recommendations: list,
    project_id: Optional[str] = None,
    clarifications: Optional[list] = None,
    gaps: Optional[list] = None,
    readiness_score: int = 70,
    improved_spec: Optional[str] = None,
    status: str = "Needs Review"
):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            INSERT OR REPLACE INTO analyses 
            (id, project_id, user_requirement, structured_requirement, clarifications, gaps, readiness_score, improved_spec, category, status, mode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                analysis_id,
                project_id,
                user_requirement,
                json.dumps(structured_requirement),
                json.dumps(clarifications) if clarifications else None,
                json.dumps(gaps) if gaps else None,
                readiness_score,
                improved_spec,
                category,
                status,
                mode
            )
        )
        
        # Delete prior recommendations for this analysis if any
        cursor.execute("DELETE FROM recommendations WHERE analysis_id = ?", (analysis_id,))

        for idx, rec in enumerate(recommendations):
            rec_id = f"{analysis_id}-rec-{idx+1}"
            cursor.execute(
                """
                INSERT INTO recommendations 
                (id, analysis_id, standard_id, title, role_category, match_score, applicability, why_recommended)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    rec_id,
                    analysis_id,
                    rec.get("standard_id", ""),
                    rec.get("title", ""),
                    rec.get("role_category", "PRIMARY"),
                    rec.get("match_score", 0.0),
                    rec.get("applicability", ""),
                    rec.get("why_recommended", "")
                )
            )

        # Log activity
        cursor.execute(
            """
            INSERT INTO activity_logs (id, user_id, project_id, action, details)
            VALUES (?, 'USR-GOV-001', ?, 'Procurement Requirement Analyzed', ?)
            """,
            (
                f"ACT-{uuid.uuid4().hex[:6].upper()}",
                project_id,
                f"Requirement analyzed: '{user_requirement[:60]}...' (Score: {readiness_score}/100)"
            )
        )
            
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Error saving analysis to DB: {e}")

def get_history(limit: int = 50) -> List[Dict[str, Any]]:
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                a.id,
                a.user_requirement,
                a.category,
                a.readiness_score,
                a.status,
                a.created_at,
                COUNT(r.id) as recommendations_count,
                (SELECT standard_id FROM recommendations WHERE analysis_id = a.id ORDER BY match_score DESC LIMIT 1) as top_standard
            FROM analyses a
            LEFT JOIN recommendations r ON a.id = r.analysis_id
            GROUP BY a.id
            ORDER BY a.created_at DESC
            LIMIT ?
        """
        cursor.execute(query, (limit,))
        rows = cursor.fetchall()
        
        result = []
        for r in rows:
            result.append({
                "id": r["id"],
                "user_requirement": r["user_requirement"],
                "category": r["category"] or "General",
                "recommendations_count": r["recommendations_count"],
                "readiness_score": r["readiness_score"] or 72,
                "status": r["status"] or "Needs Review",
                "top_standard": r["top_standard"],
                "created_at": r["created_at"]
            })
        conn.close()
        return result
    except Exception as e:
        logger.error(f"Error retrieving history: {e}")
        return []

def get_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
            
        cursor.execute("SELECT * FROM recommendations WHERE analysis_id = ?", (analysis_id,))
        recs = cursor.fetchall()
        
        conn.close()
        return {
            "id": row["id"],
            "project_id": row["project_id"],
            "user_requirement": row["user_requirement"],
            "structured_requirement": json.loads(row["structured_requirement"]) if row["structured_requirement"] else {},
            "clarifications": json.loads(row["clarifications"]) if row["clarifications"] else [],
            "gaps": json.loads(row["gaps"]) if row["gaps"] else [],
            "readiness_score": row["readiness_score"],
            "improved_spec": row["improved_spec"],
            "category": row["category"],
            "status": row["status"],
            "mode": row["mode"],
            "created_at": row["created_at"],
            "recommendations": [dict(r) for r in recs]
        }
    except Exception as e:
        logger.error(f"Error retrieving analysis {analysis_id}: {e}")
        return None

# --- Saved Standards ---
def save_standard_bookmark(user_id: str, standard_id: str, project_id: Optional[str] = None, notes: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    b_id = f"BKM-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute(
        """
        INSERT INTO saved_standards (id, user_id, project_id, standard_id, notes)
        VALUES (?, ?, ?, ?, ?)
        """,
        (b_id, user_id, project_id, standard_id, notes)
    )
    if project_id:
        add_item_to_project(project_id, "standard", standard_id, f"Standard {standard_id}", {"notes": notes})
    conn.commit()
    conn.close()

def get_saved_standards(user_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM saved_standards WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def delete_saved_standard(saved_id_or_std_id: str, user_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM saved_standards WHERE (id = ? OR standard_id = ?) AND user_id = ?",
        (saved_id_or_std_id, saved_id_or_std_id, user_id)
    )
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


# --- Activity Logs & Reports ---
def get_activity_logs(limit: int = 20) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def save_report(user_id: str, title: str, format_type: str, content: dict, project_id: Optional[str] = None, analysis_id: Optional[str] = None) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    rep_id = f"REP-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute(
        """
        INSERT INTO reports (id, user_id, project_id, analysis_id, title, format, content_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (rep_id, user_id, project_id, analysis_id, title, format_type, json.dumps(content))
    )
    if project_id:
        add_item_to_project(project_id, "report", rep_id, title, {"format": format_type})
    conn.commit()
    conn.close()
    return rep_id

def get_reports(user_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, user_id, project_id, analysis_id, title, format, created_at FROM reports WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows
