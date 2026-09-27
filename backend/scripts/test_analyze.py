import httpx
import json

payload = {
    "requirement": "We need 500 energy-efficient LED street lights for municipal roads."
}

res = httpx.post("http://127.0.0.1:8000/api/analyze", json=payload, timeout=10.0)
print("Status Code:", res.status_code)
data = res.json()
print("Structured Requirement:", json.dumps(data.get("structured_requirement"), indent=2))
print("Top Recommendation:", data.get("recommendations", [{}])[0].get("standard_id"), data.get("recommendations", [{}])[0].get("title"))
print("Match Score:", data.get("recommendations", [{}])[0].get("match_score"))
print("Why Recommended:", data.get("recommendations", [{}])[0].get("why_recommended"))
print("Related Standards Count:", len(data.get("related_standards", [])))
print("Version Status Count:", len(data.get("version_status", [])))
