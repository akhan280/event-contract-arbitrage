import requests

from py_clob_client.client import ClobClient
from py_clob_client.clob_types import OrderArgs, PartialCreateOrderOptions, MarketOrderArgs, OrderScoringParams, OpenOrderParams
from py_clob_client.order_builder.constants import BUY, SELL
from py_clob_client.exceptions import PolyApiException
from math import floor


# funder = "" #The Funder is the adress as seen on your Polymarket profile.
# host = "https://clob.polymarket.com"
# key = "0cce44f112cb46aca5ec4efe3a3439269244b273a18314c09333a985a4018a5d" #This is your private key. See above for details 
# chain_id = 137
# signature_type = 1


# client = ClobClient(host, key=key, chain_id=chain_id)


# resp = client.get_markets(next_cursor = "1")
# print(resp)
# print("Done!")


import requests
from datetime import datetime

url = "https://gamma-api.polymarket.com/events"

response = requests.request("GET", url)

if response.status_code == 200:
    markets = response.json()  # Parse the JSON response
    now = datetime.utcnow()  # Get the current UTC time

    
    filtered_events = [
        market for market in markets if (market["active"] == True)
    ]

    print("Filtered Events:")
    print(filtered_events)
else:
    print(f"Failed to fetch markets. Status code: {response.status_code}")