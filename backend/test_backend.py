import requests
import asyncio
import websockets
import json

BASE_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000/api/ws"

def test_vendor_api():
    print("--- 1. Testing Vendor API ---")
    # Get vendors
    res = requests.get(f"{BASE_URL}/api/vendors?skip=0&limit=1")
    if res.status_code == 200:
        data = res.json()
        print(f"GET /api/vendors OK, fetched {len(data['data'])} vendors.")
        if len(data['data']) > 0:
            vendor_id = data['data'][0]['id']
            # Get specific vendor
            v_res = requests.get(f"{BASE_URL}/api/vendors/{vendor_id}")
            if v_res.status_code == 200:
                v_data = v_res.json()
                print(f"GET /api/vendors/{vendor_id} OK, Vendor Name: {v_data['name']}")
            else:
                print(f"Failed to get vendor details: {v_res.status_code}")
    else:
        print(f"Failed to get vendors: {res.status_code}")

def test_simulation():
    print("\n--- 2. Testing What-if Simulation ---")
    # To test simulation, we first need a vendor ID. Let's use vendor ID 1
    # assuming we can run a generic scenario on it.
    # We will POST to /api/simulation/run
    payload = {
        "target_entity": "vendor",
        "entity_ids": [1], # Assuming vendor ID 1 exists
        "scenario": {
            "type": "NATURAL_DISASTER",
            "severity": 8,
            "region": "Asia",
            "description": "Simulated Earthquake"
        }
    }
    
    res = requests.post(f"{BASE_URL}/api/simulation/run", json=payload)
    if res.status_code == 200:
        data = res.json()
        print(f"Simulation OK. Simulated changes for {len(data['vendor_results'])} vendors.")
        if len(data['vendor_results']) > 0:
            print(f"Old Score: {data['vendor_results'][0]['old_score']} -> New Score: {data['vendor_results'][0]['simulated_score']}")
    else:
        print(f"Simulation failed: {res.status_code} {res.text}")

def test_events_api():
    print("\n--- 3. Testing Events API (Trigger NewsAPI) ---")
    # See if there's a trigger endpoint or just fetch active events
    res = requests.get(f"{BASE_URL}/api/events/active")
    if res.status_code == 200:
        data = res.json()
        print(f"GET /api/events/active OK, found {len(data)} active events.")
    else:
        print(f"Failed to get active events: {res.status_code}")

async def test_websocket():
    print("\n--- 4. Testing WebSocket Connection ---")
    try:
        async with websockets.connect(WS_URL) as ws:
            print("WebSocket connected successfully!")
            print("Sending ping...")
            await ws.send("ping")
            print("Waiting for response (timeout 2s)...")
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=2.0)
                print(f"Received message: {msg[:100]}...")
            except asyncio.TimeoutError:
                print("No message received within 2 seconds (normal if no active pushes happen).")
    except Exception as e:
        print(f"WebSocket connection failed: {e}")

if __name__ == "__main__":
    test_vendor_api()
    test_simulation()
    test_events_api()
    asyncio.run(test_websocket())
