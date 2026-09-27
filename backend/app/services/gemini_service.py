import json
import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL or "gemini-2.0-flash"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5 and not settings.DEMO_MODE)

    async def extract_requirement(self, user_requirement: str) -> Optional[Dict[str, Any]]:
        """
        Uses Gemini LLM to extract structured procurement requirements in JSON.
        Strict anti-hallucination prompt.
        """
        if not self.is_configured():
            return None

        prompt = f"""
You are an expert procurement standards intelligence engineer for government and enterprise tenders.
Analyze the following natural language procurement requirement and extract a strictly structured JSON response.

CRITICAL RULES:
1. Do NOT invent standard numbers or fake BIS codes.
2. Only extract what is explicitly mentioned or clearly implied by the procurement requirement.
3. Respond ONLY with valid JSON. No conversational preamble, no markdown backticks.

Procurement Requirement:
"{user_requirement}"

Respond strictly with this JSON structure:
{{
  "product": "Core product or equipment name (e.g. LED Street Lights)",
  "category": "Broad category (Lighting / Electrical Equipment / Office Furniture / Construction Materials / Safety Equipment / IT & Office Hardware / Water Supply & Sanitation / General)",
  "application": "Deployment context (e.g. Municipal roadways and street lighting)",
  "environment": "Operating environment (e.g. Outdoor municipal roads, weather-exposed)",
  "quantity": 500 (integer or null if not specified),
  "requirements": [
    "Extracted technical requirement 1",
    "Extracted technical requirement 2"
  ],
  "keywords": [
    "keyword1",
    "keyword2"
  ]
}}
"""
        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            raw_text = parts[0].get("text", "").strip()
                            # Clean up if model added markdown markers
                            if raw_text.startswith("```"):
                                raw_text = raw_text.split("```")[1]
                                if raw_text.startswith("json"):
                                    raw_text = raw_text[4:]
                            return json.loads(raw_text.strip())
                else:
                    logger.warning(f"Gemini API returned status {response.status_code}: {response.text}")
        except Exception as e:
            logger.warning(f"Gemini requirement extraction error: {e}. Falling back to deterministic NLP.")

        return None

    async def generate_explanation(
        self,
        user_requirement: str,
        structured_req: Dict[str, Any],
        standard_title: str,
        standard_scope: str,
        standard_tech_reqs: list
    ) -> Optional[str]:
        """
        Generates an explainable recommendation grounded strictly in the standard record.
        """
        if not self.is_configured():
            return None

        prompt = f"""
You are a procurement standards intelligence system explaining why an Indian Standard was matched.

USER REQUIREMENT:
"{user_requirement}"

STRUCTURED DETAILS:
- Product: {structured_req.get('product', '')}
- Category: {structured_req.get('category', '')}
- Application: {structured_req.get('application', '')}
- Key Requirements: {', '.join(structured_req.get('requirements', []))}

RETRIEVED STANDARD:
- Title: {standard_title}
- Scope: {standard_scope}
- Technical Requirements: {'; '.join(standard_tech_reqs[:4])}

TASK:
Write a concise, professional 2-sentence explanation of why this standard applies to this procurement specification.
STRICT ANTI-HALLUCINATION RULE:
- Only reference details present in the standard scope and technical requirements above.
- Never invent clauses, test reports, or unverified claims.
- Do NOT say "As an AI...". Keep it authoritative and enterprise-grade.
"""
        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2
            }
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
        except Exception as e:
            logger.warning(f"Gemini explanation generation failed: {e}")

        return None

gemini_service = GeminiService()
