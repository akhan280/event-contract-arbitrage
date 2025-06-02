import { NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE_URL = "https://demo-api.kalshi.co";
const API_KEY = process.env.KALSHI_ACCESS_KEY;
const PRIVATE_KEY_PATH = "src/lib/private_key.txt";

// Load the private key
const loadPrivateKey = () => {
  const fs = require("fs");
  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf-8");
  return privateKey;
};

// Sign the message with RSA-PSS
const signMessage = (message: string, privateKey: string) => {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(message);
  signer.end();
  return signer.sign(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    },
    "base64"
  );
};

// Fetch market data from Kalshi with pagination, only fetching 'open' markets
const fetchKalshiMarkets = async () => {
  const privateKey = loadPrivateKey();
  const path = "/trade-api/v2/markets";
  const method = "GET";
  const timestamp = Date.now().toString();

  const message = `${timestamp}${method}${path}`;
  const signature = signMessage(message, privateKey);

  const headers = {
    "KALSHI-ACCESS-KEY": API_KEY!,
    "KALSHI-ACCESS-TIMESTAMP": timestamp,
    "KALSHI-ACCESS-SIGNATURE": signature,
  };

  let cursor = "";
  let allMarkets: any[] = [];
  let pageCount = 0; // Counter for pages fetched
  const maxPages = 5; // Limit to 3 pages

  do {
    const response = await fetch(
      `${BASE_URL}${path}?limit=100&status=open${cursor ? `&cursor=${cursor}` : ""}`,
      { method, headers }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Kalshi markets: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`Page ${pageCount + 1} fetched with cursor:`, cursor);

    if (!data.markets || !Array.isArray(data.markets)) {
      throw new Error("Invalid response: 'markets' field is missing or invalid.");
    }

    allMarkets = [...allMarkets, ...data.markets];
    cursor = data.cursor || "";
    pageCount++; // Increment the page count

  } while (cursor && pageCount < maxPages);

  console.log("Total markets fetched:", allMarkets.length);
  return allMarkets;
};

// Save or update markets in Prisma
const saveMarkets = async (markets: any[]) => {
  console.log("Number of markets to save:", markets.length);
  for (const market of markets) {
    const {
      ticker,
      event_ticker,
      market_type,
      title,
      yes_ask,
      no_ask,
      volume,
      liquidity,
      category, // Include category
    } = market;

    // Validate required fields
    if (!ticker || !event_ticker || !market_type || !title) {
      console.error("Skipping invalid market:", market);
      continue;
    }

    await prisma.kalshiMarket.upsert({
      where: { ticker },
      update: {
        eventTicker: event_ticker,
        marketType: market_type,
        title,
        yesAsk: yes_ask || 0,
        noAsk: no_ask || 0,
        volume: volume || 0,
        liquidity: liquidity || 0,
      },
      create: {
        ticker,
        eventTicker: event_ticker,
        marketType: market_type,
        title,
        yesAsk: yes_ask || 0,
        noAsk: no_ask || 0,
        volume: volume || 0,
        liquidity: liquidity || 0,
      },
    });
  }
};

// API route handler
export async function GET() {
  try {
    console.log("Fetching Kalshi markets...");
    const markets = await fetchKalshiMarkets();

    console.log("Saving markets to database...");
    await saveMarkets(markets);
    console.log("Markets successfully updated.");

    return NextResponse.json({ message: "Markets successfully updated." });
  } catch (error) {
    console.error("Error fetching or saving markets:", error);
    return NextResponse.json(
      { error: "Failed to fetch or save markets.", details: error.message },
      { status: 500 }
    );
  }
}
