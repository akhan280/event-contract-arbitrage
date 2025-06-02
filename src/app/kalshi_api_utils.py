import base64
import datetime
import requests
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature

# Load the private key from a file
def load_private_key_from_file(file_path):
    with open(file_path, "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,  # Provide password if key is encrypted
        )
    return private_key

# Sign a message using RSA-PSS
def sign_pss_text(private_key: rsa.RSAPrivateKey, text: str) -> str:
    message = text.encode('utf-8')
    try:
        signature = private_key.sign(
            message,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH  # Fixed: Use MAX_LENGTH here
            ),
            hashes.SHA256()
        )
        return base64.b64encode(signature).decode('utf-8')
    except InvalidSignature as e:
        raise ValueError("RSA sign PSS failed") from e

# Send an authenticated request to Kalshi API
def send_kalshi_request(method, path, private_key_path, base_url, api_key):
    # Load the private key
    private_key = load_private_key_from_file(private_key_path)

    # Generate the timestamp
    current_time_milliseconds = int(datetime.datetime.now().timestamp() * 1000)
    timestamp_str = str(current_time_milliseconds)

    # Create the string to sign
    message = timestamp_str + method + path

    # Sign the string
    signature = sign_pss_text(private_key, message)

    # Set headers
    headers = {
        'KALSHI-ACCESS-KEY': api_key,
        'KALSHI-ACCESS-SIGNATURE': signature,
        'KALSHI-ACCESS-TIMESTAMP': timestamp_str
    }

    # Make the HTTP request
    url = base_url + path
    response = requests.request(method, url, headers=headers)

    return response
