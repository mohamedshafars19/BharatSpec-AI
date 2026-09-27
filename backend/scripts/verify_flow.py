import urllib.request
import json
import sys

def test_endpoint(name, url, method='GET', data=None):
    try:
        body = json.dumps(data).encode('utf-8') if data else None
        headers = {'Content-Type': 'application/json'} if data else {}
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        res = urllib.request.urlopen(req)
        status = res.getcode()
        payload = json.loads(res.read())
        print(f"[PASS] {name} ({status}): OK")
        return payload
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        return None

print("=== BACKEND API ENDPOINTS VERIFICATION ===")
test_endpoint("Health Check", "http://127.0.0.1:8000/api/health")
test_endpoint("Dashboard Overview", "http://127.0.0.1:8000/api/dashboard")

projects = test_endpoint("List Projects", "http://127.0.0.1:8000/api/projects")
if projects and len(projects) > 0:
    proj_id = projects[0]["id"]
    test_endpoint("Get Project By ID", f"http://127.0.0.1:8000/api/projects/{proj_id}")

standards = test_endpoint("List Standards", "http://127.0.0.1:8000/api/standards")
if standards and len(standards) > 0:
    std_id = standards[0]["id"]
    test_endpoint("Get Standard By ID", f"http://127.0.0.1:8000/api/standards/{std_id}")
    test_endpoint("Get Standard Relationships", f"http://127.0.0.1:8000/api/standards/{std_id}/relationships")
    test_endpoint("Get Standard Versions", f"http://127.0.0.1:8000/api/standards/{std_id}/versions")

test_endpoint("Compare Standards", "http://127.0.0.1:8000/api/standards/compare", method="POST", data={"standard_ids": ["DEMO-STD-001", "DEMO-STD-002"]})

analysis = test_endpoint("Analyze Requirement", "http://127.0.0.1:8000/api/analyze", method="POST", data={"requirement": "We need 500 energy-efficient LED street lights for municipal roads. They should work outdoors and have IP66 protection."})
if analysis:
    anl_id = analysis["analysis_id"]
    test_endpoint("Clarify Analysis", "http://127.0.0.1:8000/api/analyze/clarify", method="POST", data={"analysis_id": anl_id, "answers": [{"question_id": "q_env_rating", "selected_option": "Coastal outdoor (C4/C5, marine grade)"}]})
    test_endpoint("Generate Report", "http://127.0.0.1:8000/api/reports/generate", method="POST", data={"analysis_id": anl_id, "format": "md"})

test_endpoint("List Saved Standards", "http://127.0.0.1:8000/api/standards/saved")
test_endpoint("List History", "http://127.0.0.1:8000/api/history")
test_endpoint("List Reports", "http://127.0.0.1:8000/api/reports")

print("\n=== FRONTEND VITE HTTP CHECK ===")
try:
    res = urllib.request.urlopen("http://localhost:5173")
    print(f"[PASS] Frontend Root HTTP: {res.getcode()} OK")
except Exception as e:
    print(f"[FAIL] Frontend Root HTTP: {e}")
