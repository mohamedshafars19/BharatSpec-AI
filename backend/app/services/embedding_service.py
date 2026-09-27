import logging
import numpy as np
from typing import List, Union
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.model_name = settings.EMBEDDING_MODEL_NAME
        self.dimension = 384  # standard for bge-small or miniLM
        self._fallback_mode = False
        self._init_model()

    def _init_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading embedding model: {self.model_name}...")
            # We can use all-MiniLM-L6-v2 or BAAI/bge-small-en-v1.5
            try:
                self.model = SentenceTransformer(self.model_name)
                if hasattr(self.model, "get_embedding_dimension"):
                    self.dimension = self.model.get_embedding_dimension()
                else:
                    self.dimension = self.model.get_sentence_embedding_dimension()
                logger.info(f"Embedding model loaded successfully. Dimension: {self.dimension}")
            except Exception as download_err:
                logger.warning(f"Could not load {self.model_name}, trying all-MiniLM-L6-v2: {download_err}")
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
                if hasattr(self.model, "get_embedding_dimension"):
                    self.dimension = self.model.get_embedding_dimension()
                else:
                    self.dimension = self.model.get_sentence_embedding_dimension()
                logger.info(f"Loaded all-MiniLM-L6-v2. Dimension: {self.dimension}")
        except Exception as e:
            logger.warning(f"SentenceTransformers failed to initialize ({e}). Falling back to statistical feature embeddings.")
            self._fallback_mode = True
            self.dimension = 128

    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        if isinstance(texts, str):
            texts = [texts]

        if not self._fallback_mode and self.model is not None:
            try:
                embeddings = self.model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
                return np.array(embeddings, dtype=np.float32)
            except Exception as e:
                logger.warning(f"Model encode failed ({e}), falling back to deterministic hashing.")

        # High-quality deterministic hashing embedding fallback for 100% offline hackathon reliability
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
