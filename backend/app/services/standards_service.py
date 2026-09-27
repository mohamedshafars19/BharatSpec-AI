import json
import logging
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.models.schemas import StandardRecord

logger = logging.getLogger(__name__)

class StandardsService:
    def __init__(self):
        self._standards: Dict[str, StandardRecord] = {}
        self._load_standards()

    def _load_standards(self):
        try:
            if not settings.STANDARDS_FILE.exists():
                logger.warning(f"Standards file not found at {settings.STANDARDS_FILE}")
                return
                
            with open(settings.STANDARDS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            for item in data:
                record = StandardRecord(**item)
                self._standards[record.id] = record
                
            logger.info(f"Loaded {len(self._standards)} standards into memory.")
        except Exception as e:
            logger.error(f"Failed to load standards: {e}")

    def get_all(self) -> List[StandardRecord]:
        return list(self._standards.values())

    def get_by_id(self, standard_id: str) -> Optional[StandardRecord]:
        return self._standards.get(standard_id)

    def search(self, query: str = "", category: Optional[str] = None) -> List[StandardRecord]:
        query_lower = query.lower().strip()
        results = []
        for std in self._standards.values():
            if category and category.lower() != "all" and std.category.lower() != category.lower():
                continue
            if not query_lower:
                results.append(std)
                continue
                
            # Search matches across ID, title, keywords, scope, category
            searchable = f"{std.id} {std.title} {std.category} {std.scope} {' '.join(std.keywords)}".lower()
            if query_lower in searchable:
                results.append(std)
                
        return results

    def get_searchable_text(self, std: StandardRecord) -> str:
        """
        Creates a dense textual representation for vector embedding generation.
        """
        tech_reqs = "; ".join(std.technical_requirements[:5])
        keywords = ", ".join(std.keywords)
        return (
            f"Standard ID: {std.id}. "
            f"Category: {std.category}. "
            f"Title: {std.title}. "
            f"Scope: {std.scope}. "
            f"Description: {std.description}. "
            f"Keywords: {keywords}. "
            f"Key Requirements: {tech_reqs}."
        )

standards_service = StandardsService()
