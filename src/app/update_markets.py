import os
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from kalshi_api_utils import send_kalshi_request

# Use the same DATABASE_URL environment variable as Prisma
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """Establish a database connection."""
    return psycopg2.connect(DATABASE_URL)

def upsert_markets(markets):
    """Insert or update markets in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Prisma's table is named "KalshiMarket" with these fields
    query = """
    INSERT INTO "KalshiMarket" (
        id, kalshiId, ticker, eventTicker, marketType, title, yesAsk, noAsk, volume, liquidity, createdAt, updatedAt
    ) VALUES %s
    ON CONFLICT (kalshiId) DO UPDATE SET
        ticker = EXCLUDED.ticker,
        eventTicker = EXCLUDED.eventTicker,
        marketType = EXCLUDED.marketType,
        title = EXCLUDED.title,
        yesAsk = EXCLUDED.yesAsk,
        noAsk = EXCLUDED.noAsk,
        volume = EXCLUDED.volume,
        liquidity = EXCLUDED.liquidity,
        updatedAt = EXCLUDED.updatedAt;
    """

    # Prepare data for upsert
    values = [
        (
            market["id"],  # Prisma ID (primary key)
            market["id"],  # Kalshi ID (unique constraint)
            market["ticker"],
            market["event_ticker"],
            market["market_type"],
            market["title"],
            market["yes_ask"],
            market["no_ask"],
            market["volume"],
            market["liquidity"],
            datetime.utcnow(),  # createdAt
            datetime.utcnow(),  # updatedAt
        )
        for market in markets
    ]

    # Execute the query
    execute_values(cursor, query, values)
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    response = send_kalshi_request(
        method="GET",
        path="/trade-api/v2/markets",
        private_key_path="private_key.txt",
        base_url="https://demo-api.kalshi.co",
        api_key="4654af9a-036c-4249-8b7b-d82fb5e86732"
    )

    if response.status_code == 200:
        markets = response.json()
        upsert_markets(markets)
        print("Markets successfully updated in the Prisma-managed database.")
    else:
        print(f"Error fetching markets: {response.status_code}, {response.text}")