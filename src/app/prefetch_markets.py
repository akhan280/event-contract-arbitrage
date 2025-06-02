from kalshi_api_utils import send_kalshi_request

BASE_URL = 'https://demo-api.kalshi.co'
API_KEY = '4654af9a-036c-4249-8b7b-d82fb5e86732'
PRIVATE_KEY_PATH = 'private_key.txt'

def fetch_markets():
    path = '/trade-api/v2/markets'
    method = 'GET'
    
    response = send_kalshi_request(method, path, PRIVATE_KEY_PATH, BASE_URL, API_KEY)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch markets: {response.status_code}, {response.text}")

if __name__ == "__main__":
    markets = fetch_markets()
    print("Fetched markets:", markets)