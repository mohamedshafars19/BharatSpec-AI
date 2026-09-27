#!/usr/bin/env python3
"""
FAISS Index Builder for BharatSpec AI.
Loads standards dataset, generates embeddings, and saves the FAISS index & metadata.
"""
import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.config import settings
from app.services.standards_service import standards_service
from app.services.embedding_service import embedding_service
from app.services.vector_search_service import vector_search_service

def main():
    print("=" * 60)
    print("BharatSpec AI — Standards FAISS Vector Index Builder")
    print("=" * 60)
    
    standards = standards_service.get_all()
    print(f"Loaded {len(standards)} standards from {settings.STANDARDS_FILE}")
    
    print(f"Using Embedding Model: {settings.EMBEDDING_MODEL_NAME}")
    print("Generating embeddings and building FAISS index...")
    vector_search_service.build_index()
    
    print("\n[SUCCESS] Index build complete!")
    print(f"Index file: {settings.FAISS_INDEX_FILE}")
    print(f"Metadata file: {settings.METADATA_FILE}")

if __name__ == "__main__":
    main()
