import httpx
import os
from dotenv import load_dotenv

load_dotenv()

# We will send a request to our running backend to register the user
# This ensures that both the Supabase Auth account AND the 'users' profile table row are created.
register_url = "http://127.0.0.1:8001/api/v1/auth/register"

user_data = {
    "email": "asha@phc.gov.in",
    "password": "Password123!",
    "full_name": "Rita Devi",
    "role": "asha_worker",
    "phone": "9876543210",
    "phc_name": "Central PHC",
    "district": "Pune",
    "village": "Rural Village"
}

print(f"Sending registration request to {register_url}...")
try:
    response = httpx.post(register_url, json=user_data, timeout=10.0)
    print("Status Code:", response.status_code)
    print("Response Content:")
    print(response.json())
except Exception as e:
    print("Error connecting to backend:", e)
