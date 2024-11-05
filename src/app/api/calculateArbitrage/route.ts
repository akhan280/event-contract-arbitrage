// app/api/calculateArbitrage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { ArbitrageRequest, ArbitrageResponse, Market } from '@/lib/types';

interface EtherscanGasOracleResponse {
  status: string;
  message: string;
  result: {
    LastBlock: string;
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
    suggestBaseFee: string;
    gasUsedRatio: string;
  };
}


export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ArbitrageRequest = await request.json();
    const { markets } = body;

    console.log("[POST] Returned Markets" )

    const arbitrageResults: ArbitrageResponse = calculateArbitrage(markets);
    console.log("[Arbitrage results]", arbitrageResults)
    return NextResponse.json({ success: true, data: arbitrageResults });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
  }


interface CoinGeckoResponse {
  ethereum: {
    usd: number;
  };
}

async function fetchGasPrice(): Promise<number> {
  try {
    const response = await axios.get<EtherscanGasOracleResponse>(
      `${process.env.ETHERSCAN_API_URL}?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    if (response.data.status === '1' && response.data.message === 'OK') {
      // Use SafeGasPrice for conservative estimate
      const safeGasPrice = parseInt(response.data.result.SafeGasPrice);
      const baseFee = parseFloat(response.data.result.suggestBaseFee);

      // Total gas price is base fee + priority fee (SafeGasPrice)
      const totalGasPrice = Math.ceil(baseFee + safeGasPrice);

      console.log(`Gas Price Info | Base Fee: ${baseFee} | Safe Priority Fee: ${safeGasPrice} | Total: ${totalGasPrice}`);

      return totalGasPrice;
    } else {
      console.warn('Etherscan API warning:', response.data.message);
      return 30;
    }
  } catch (error) {
    console.error('Error fetching gas price from Etherscan:', error);
    return 30;
  }
}

async function convertGasPriceToUSDC(gasPriceInGwei: number): Promise<number> {
  try {
    const response = await axios.get<CoinGeckoResponse>(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'ethereum',
          vs_currencies: 'usd',
        },
      }
    );

    const ethPriceInUSD = response.data.ethereum.usd;
    const gasLimit = 150000; // Basic transaction gas limit
    const gasCostInETH = (gasPriceInGwei * 1e-9) * gasLimit;
    const gasCostInUSD = gasCostInETH * ethPriceInUSD;

    console.log(`Gas Cost | ETH Price: $${ethPriceInUSD} | Cost in USD: $${gasCostInUSD}`);

    return gasCostInUSD;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    // Return a default gas cost if API call fails
    return 0.5;
  }
}

interface Position {
  candidate: string;
  position: 'Yes' | 'No';
  market: string;
  price: number;
}

function calculateArbitrage(markets: Market[]): ArbitrageResponse {
  // Helper function to standardize candidate names
  function getCandidateName(name: string): string {
      // Extract candidate's name by removing any market-specific suffixes or prefixes
      // Adjust this function as we change the naming conventions
      return name.toLowerCase();
  }

  // Generate all positions
  function generatePositions(markets: Market[]): Position[] {
      const positions: Position[] = [];
      for (const market of markets) {
          for (const option of market.options) {
              const candidate = getCandidateName(option.name);
              positions.push({
                  candidate,
                  position: 'Yes',
                  market: market.broker,
                  price: option.prices.buy.yes,
              });
              positions.push({
                  candidate,
                  position: 'No',
                  market: market.broker,
                  price: option.prices.buy.no,
              });
          }
      }
      return positions;
  }

  // Find arbitrage opportunities
  function findArbitrage(positions: Position[]): ArbitrageResponse {
      const results: ArbitrageResponse['results'] = [];

      for (const pos of positions) {
          // Complement positions
          const complements = positions.filter((comp) => {
              // Skip if same position and market
              if (comp === pos) {
                  return false;
              }

              // Same candidate, opposite position, any market
              const sameCandidateOppositePosition =
                  comp.candidate === pos.candidate && comp.position !== pos.position;

              // Other candidate, same position, different market
              const otherCandidateSamePositionDifferentMarket =
                  comp.candidate !== pos.candidate &&
                  comp.position === pos.position &&
                  comp.market !== pos.market;

              return sameCandidateOppositePosition || otherCandidateSamePositionDifferentMarket;
          });

          for (const comp of complements) {
              const totalPrice = pos.price + comp.price;
              if (totalPrice < 100) {
                  const profitPerContract = (100 - totalPrice).toFixed(2);
                  const action = `Buy ${pos.candidate}${pos.position}${pos.market} at ${pos.price} and ${comp.candidate}${comp.position}${comp.market} at ${comp.price}`;
                  const market = `${pos.market} and ${comp.market}`;
                  const description = `Arbitrage opportunity by buying ${pos.candidate} ${pos.position} on ${pos.market} and ${comp.candidate} ${comp.position} on ${comp.market}`;

                  results.push({
                      market,
                      action,
                      profitPerContract,
                      totalFees: '0', // Fees are ignored as per your instruction
                      netProfit: profitPerContract,
                      description,
                  });
              }
          }
      }

      // Remove duplicate results
      const uniqueResults = Array.from(
          new Map(results.map((item) => [item.action, item])).values()
      );

      return { results: uniqueResults };
  }

  const positions = generatePositions(markets);
  const arbitrageResponse = findArbitrage(positions);

  return arbitrageResponse;
}


// Function to calculate broker fees
function calculateBrokerFees(gasFee: number, broker: string): number {
  let totalFees = 0;

  if (broker === 'Polymarket') {
    const relayerFee = Math.max(3 + gasFee, 0); // For simplicity, not using 0.3% of deposit amount
    totalFees += 2 * (gasFee + relayerFee); // Deposit and withdrawal
  }

  // Add any other broker fees if applicable
  // For Kalshi, assuming no additional fees

  return totalFees;
}