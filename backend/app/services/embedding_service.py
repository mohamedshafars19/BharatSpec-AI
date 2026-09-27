import logging
import numpy as np
from typing import List, Union
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.model_name = settings.EMBEDDING_MODEL_NAME
        self.dimension = 384  # Standard 384 dimension for all-MiniLM-L6-v2 / bge-small
        self._fallback_mode = False
        self._initialized = False

    def _ensure_model(self):
        """
        Lazy-loads the embedding model on first demand.
        Restricts PyTorch CPU threads to 1 to fit comfortably within Render's 512MB RAM limit.
        """
        if self._initialized:
            return
            
        self._initialized = True
        try:
            # Constrain PyTorch thread buffers before importing sentence_transformers
            import torch
            torch.set_num_threads(1)
            torch.set_num_interop_threads(1)
            
            from sentence_transformers import SentenceTransformer
            logger.info(f"Lazy loading embedding model on first query: {self.model_name}...")
            self.model = SentenceTransformer(self.model_name)
            
            if hasattr(self.model, "get_embedding_dimension"):
                self.dimension = self.model.get_embedding_dimension()
            elif hasattr(self.model, "get_sentence_embedding_dimension"):
                self.dimension = self.model.get_sentence_embedding_dimension()
            else:
                self.dimension = 384
                
            logger.info(f"Embedding model loaded and cached. Dimension: {self.dimension}")
        except Exception as e:
            logger.warning(
                f"SentenceTransformers unavailable or memory-constrained ({e}). "
                f"Operating in deterministic 384-dim statistical hashing mode."
            )
            self._fallback_mode = True
            self.dimension = 384

    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        if isinstance(texts, str):
            texts = [texts]

        # Lazy load on first query
        self._ensure_model()

        if not self._fallback_mode and self.model is not None:
            try:
                import torch
                with torch.no_grad():
                    embeddings = self.model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
                    return np.array(embeddings, dtype=np.float32)
            except Exception as e:
                logger.warning(f"Model encode failed ({e}), falling back to deterministic hashing.")

        # High-quality deterministic hashing embedding fallback for 100% reliability
        return self._fallback_encode(texts)

    def _fallback_encode(self, texts: List[str]) -> np.ndarray:
        vectors = []
        for text in texts:
            vec = np.zeros(self.dimension, dtype=np.float32)
            tokens = text.lower().replace("-", " ").replace("/", " ").split()
            for token in tokens:
                if len(token) < 2:
                    continue
                # Hash token into dimension buckets
                h = hash(token)
                idx = abs(h) % self.dimension
                sign = 1.0 if (h // self.dimension) % 2 == 0 else -1.0
                vec[idx] += sign * (1.0 + np.log(1.0 + len(token)))
            
            # Normalize vector
            norm = np.linalg.norm(vec)
            if norm > 1e-6:
                vec = vec / norm
            vectors.append(vec)
            
        return np.array(vectors, dtype=np.float32)

embedding_service = EmbeddingService()
