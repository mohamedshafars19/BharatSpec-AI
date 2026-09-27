import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.services.embedding_service import embedding_service
from app.services.vector_search_service import vector_search_service

client = TestClient(app)

print("=== 1. TEST HEALTH ENDPOINT ===")
res = client.get("/api/health")
print(f"Status: {res.status_code}, Response: {res.json()}")
assert res.status_code == 200

print("\n=== 2. TEST STANDARDS ENDPOINT ===")
res = client.get("/api/standards")
data = res.json()
print(f"Status: {res.status_code}, Total standards: {len(data)}")
assert res.status_code == 200
assert len(data) >= 15

print("\n=== 3. TEST PROJECTS ENDPOINT ===")
res = client.get("/api/projects")
print(f"Status: {res.status_code}, Projects count: {len(res.json())}")
assert res.status_code == 200

print("\n=== 4. TEST DASHBOARD ENDPOINT ===")
res = client.get("/api/dashboard")
dash = res.json()
print(f"Status: {res.status_code}, User: {dash.get('user_name')}, Stats: {dash.get('stats')}")
assert res.status_code == 200

print("\n=== 5. CHECK MODEL STATE BEFORE ANALYSIS ===")
print("Is model loaded before analyze?", embedding_service.model is not None)
assert embedding_service.model is None, "Model should NOT be loaded until analyze is invoked!"

print("\n=== 6. TEST ANALYZE ENDPOINT (Triggers Lazy Load + FAISS Search) ===")
req_payload = {
    "requirement": "We need 500 units of energy-efficient LED street lights for municipal roads. Suitable for outdoor with IP66 ingress protection and built-in surge protection.",
    "category": "Lighting",
    "application": "Municipal Roadways",
    "quantity": 500
}
res = client.post("/api/analyze", json=req_payload)
print(f"Status: {res.status_code}")
assert res.status_code == 200
analysis = res.json()
print("Analysis ID:", analysis.get("analysis_id"))
print("Readiness Score:", analysis.get("audit", {}).get("readiness_score"))
print("Recommendations count:", len(analysis.get("recommendations", [])))
for rec in analysis.get("recommendations", [])[:3]:
    print(f"  * [{rec.get('role_category')}] {rec.get('standard_id')}: {rec.get('title')} (Score: {rec.get('match_score')})")

print("\n=== 7. VERIFY MODEL STATE AFTER ANALYSIS ===")
print("Is model loaded now?", embedding_service.model is not None)
assert embedding_service.model is not None, "Model should now be loaded and cached!"
first_model_id = id(embedding_service.model)
print("Cached Model instance ID:", first_model_id)

print("\n=== 8. TEST SECOND ANALYZE QUERY (Verify Caching / No Reload) ===")
res2 = client.post("/api/analyze", json={"requirement": "Supply of power distribution transformers 11kV 500kVA oil immersed"})
assert res2.status_code == 200
second_model_id = id(embedding_service.model)
print("Model ID 1:", first_model_id)
print("Model ID 2:", second_model_id)
assert first_model_id == second_model_id
print("CONFIRMED: Exact same cached model instance reused, zero duplicate loading!")

print("\n=== ALL LOCAL BACKEND TESTS PASSED SUCCESSFULLY! ===")
