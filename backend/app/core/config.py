import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory if present
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "BharatSpec AI"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-Powered Indian Standards Recommendation Engine for Procurement Specifications"
    
    # Gemini configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()
    
    # Explicit demo mode or auto-fallback if API key is absent
    _demo_mode_env = os.getenv("DEMO_MODE", "").lower()
    DEMO_MODE: bool = (_demo_mode_env in ("true", "1", "yes")) or (len(GEMINI_API_KEY) == 0)
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", str(BASE_DIR / "bharatspec.db"))
    
    # CORS
    _cors_env: str = os.getenv("CORS_ORIGINS", "").strip()
    if _cors_env:
        if _cors_env.startswith("["):
            import json
            try:
                CORS_ORIGINS: list[str] = json.loads(_cors_env)
            except Exception:
                CORS_ORIGINS: list[str] = [x.strip() for x in _cors_env.split(",") if x.strip()]
        else:
            CORS_ORIGINS: list[str] = [x.strip() for x in _cors_env.split(",") if x.strip()]
    else:
        CORS_ORIGINS: list[str] = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://bharat-spec-ai.vercel.app",
            "https://bharatspec-ai.vercel.app",
        ]
    
    # Paths
    DATA_DIR: Path = BASE_DIR / "data"
    STANDARDS_FILE: Path = DATA_DIR / "standards.json"
    VECTOR_STORE_DIR: Path = BASE_DIR / "vector_store"
    FAISS_INDEX_FILE: Path = VECTOR_STORE_DIR / "standards.index"
    METADATA_FILE: Path = VECTOR_STORE_DIR / "metadata.json"
    
    # Embedding Model (lightweight 384-dim all-MiniLM-L6-v2 optimized for 512MB RAM)
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")

settings = Settings()
