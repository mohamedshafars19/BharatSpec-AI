import json
import logging
import numpy as np
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional

from app.core.config import settings
from app.models.schemas import StandardRecord
from app.services.standards_service import standards_service
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)

class VectorSearchService:
    def __init__(self):
        self.index = None
        self.id_map: List[str] = []
        self._faiss_available = False
        self._check_faiss()
        self.load_or_build_index()

    def _check_faiss(self):
        try:
            import faiss
            self.faiss = faiss
            self._faiss_available = True
        except ImportError:
            logger.warning("FAISS not installed or available. Using numpy cosine similarity fallback.")
            self._faiss_available = False

    def load_or_build_index(self):
        settings.VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
        
        index_file = settings.FAISS_INDEX_FILE
        meta_file = settings.METADATA_FILE
        
        if index_file.exists() and meta_file.exists() and self._faiss_available:
            try:
                self.index = self.faiss.read_index(str(index_file))
                with open(meta_file, "r", encoding="utf-8") as f:
                    self.id_map = json.load(f)
                logger.info(f"Loaded existing FAISS index with {len(self.id_map)} standards.")
                return
            except Exception as e:
                logger.warning(f"Failed to read existing index ({e}). Rebuilding...")

        # Build index if not loaded
        self.build_index()

    def build_index(self):
        all_standards = standards_service.get_all()
        if not all_standards:
            logger.warning("No standards found to index.")
            return

        texts = [standards_service.get_searchable_text(s) for s in all_standards]
        ids = [s.id for s in all_standards]
        
        embeddings = embedding_service.encode(texts)
        # Normalize
        faiss_matrix = np.ascontiguousarray(embeddings, dtype=np.float32)

        if self._faiss_available:
            dim = embeddings.shape[1]
            # Use IndexFlatIP for normalized cosine similarity
            self.index = self.faiss.IndexFlatIP(dim)
            self.index.add(faiss_matrix)
            self.id_map = ids

            # Save to disk
            settings.VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
            self.faiss.write_index(self.index, str(settings.FAISS_INDEX_FILE))
            with open(settings.METADATA_FILE, "w", encoding="utf-8") as f:
                json.dump(ids, f, indent=2)
            logger.info(f"Built and saved FAISS index with {len(ids)} standards to {settings.FAISS_INDEX_FILE}")
        else:
            self.id_map = ids
            self._stored_vectors = faiss_matrix
            logger.info(f"Built in-memory vector index with {len(ids)} standards.")

    def search(self, query_text: str, top_k: int = 5) -> List[Tuple[StandardRecord, float]]:
        all_standards = standards_service.get_all()
        if not all_standards:
            return []

        query_vec = embedding_service.encode([query_text])
        query_vec = np.ascontiguousarray(query_vec, dtype=np.float32)

        results: List[Tuple[StandardRecord, float]] = []

        if self._faiss_available and self.index is not None:
            try:
                # FAISS search
                distances, indices = self.index.search(query_vec, min(top_k, len(self.id_map)))
                for dist, idx in zip(distances[0], indices[0]):
                    if idx < 0 or idx >= len(self.id_map):
                        continue
                    std_id = self.id_map[idx]
                    std_record = standards_service.get_by_id(std_id)
                    if std_record:
                        # Normalize score between 0 and 1
                        score = float(max(0.0, min(1.0, (dist + 1.0) / 2.0 if dist < 0 else dist)))
                        results.append((std_record, score))
                return results
            except Exception as e:
                logger.error(f"FAISS search failed ({e}), falling back to numpy cosine...")

        # Fallback cosine similarity
        texts = [standards_service.get_searchable_text(s) for s in all_standards]
        all_vectors = embedding_service.encode(texts)
        scores = np.dot(all_vectors, query_vec[0])
        ranked_indices = np.argsort(scores)[::-1][:top_k]

        for idx in ranked_indices:
            score = float(scores[idx])
            std_record = all_standards[idx]
            norm_score = max(0.0, min(1.0, score))
            results.append((std_record, norm_score))

        return results

vector_search_service = VectorSearchService()
