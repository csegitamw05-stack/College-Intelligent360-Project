import urllib.request
import urllib.error
import json

base_url = 'https://college-intelligent360-project-1.onrender.com/api/v1'

# Login
login_data = json.dumps({'email': 'incharge_cse@campus.edu', 'password': 'Password123!'}).encode()
req = urllib.request.Request(f'{base_url}/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req)
token = json.loads(res.read().decode())['access_token']
print("Got Token:", token[:20], "...")

# Get Incharge Dashboard
req2 = urllib.request.Request(f'{base_url}/dashboard/incharge', headers={'Authorization': f'Bearer {token}'})
try:
    res2 = urllib.request.urlopen(req2)
    print("Dashboard Response Status:", res2.status)
    print("Dashboard Data Preview:", res2.read().decode()[:150])
except urllib.error.HTTPError as e:
    print("Dashboard Error Status:", e.code)
    print("Dashboard Error Body:", e.read().decode())
