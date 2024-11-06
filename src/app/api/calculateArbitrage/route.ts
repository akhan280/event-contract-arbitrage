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

interface CoinGeckoResponse {
  ethereum: {
    usd: number;
  };
}

interface Position {
  candidate: string;
  position: 'Yes' | 'No';
  market: string;
  price: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ArbitrageRequest = await request.json();
    const { markets, principal, dte } = body;

    console.log("[POST] Returned Markets");

    // Fetch gas fee in USD
    const gasPriceInGwei = await fetchGasPrice();
    const gasFeeInUSD = await convertGasPriceToUSDC(gasPriceInGwei);

    const arbitrageResults: ArbitrageResponse = calculateArbitrage(markets, principal, dte, gasFeeInUSD);
    console.log("[Arbitrage results]", arbitrageResults);

    return NextResponse.json({ success: true, data: arbitrageResults });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function fetchGasPrice(): Promise<number> {
  try {
    const response = await axios.get<EtherscanGasOracleResponse>(
      `${process.env.ETHERSCAN_API_URL}?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    if (response.data.status === '1' && response.data.message === 'OK') {
      const safeGasPrice = parseInt(response.data.result.SafeGasPrice);
      const baseFee = parseFloat(response.data.result.suggestBaseFee);

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
    const gasLimit = 150000;
    const gasCostInETH = (gasPriceInGwei * 1e-9) * gasLimit;
    const gasCostInUSD = gasCostInETH * ethPriceInUSD;

    console.log(`Gas Cost | ETH Price: $${ethPriceInUSD} | Cost in USD: $${gasCostInUSD}`);

    return gasCostInUSD;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return 0.5;
  }
}

function calculateBrokerFees(gasFee: number, broker: string): { perContractFee: number, perTransactionFee: number } {
  let perContractFee = 0;
  let perTransactionFee = 0;

  if (broker === 'Polymarket') {
    const relayerFee = Math.max(3 + gasFee, 0); // Assuming a minimum relayer fee
    perTransactionFee = 2 * (gasFee + relayerFee); // Deposit and withdrawal fees
  } else if (broker === 'Robinhood') {
    perContractFee = 0.01 * 2; // $0.01 per contract per side
  }
  // Add any other broker fees if applicable
  // For Kalshi, assuming no additional fees

  return { perContractFee, perTransactionFee };
}

function calculateArbitrage(markets: Market[], principal: number, DTE: number, gasFeeInUSD: number): ArbitrageResponse {
  function getCandidateName(name: string): string {
    // Adjust this function as we change the naming conventions
    return name.toLowerCase();
  }

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
          // Calculate fees for both brokers
          const feesPos = calculateBrokerFees(gasFeeInUSD, pos.market);
          const feesComp = calculateBrokerFees(gasFeeInUSD, comp.market);

          const perContractFeeTotal = feesPos.perContractFee + feesComp.perContractFee;
          const perTransactionFeeTotal = feesPos.perTransactionFee + feesComp.perTransactionFee;

          const costPerContract = totalPrice + perContractFeeTotal;
          const netProfitPerContract = 100 - totalPrice - perContractFeeTotal;

          // Calculate number of contracts that can be bought
          const numberOfContracts = Math.floor((principal - perTransactionFeeTotal) / costPerContract);

          // Ensure number of contracts is at least 1
          if (numberOfContracts < 1) {
            continue;
          }

          // Calculate total net profit
          const totalNetProfit = (netProfitPerContract * numberOfContracts) - perTransactionFeeTotal;

          // Skip if total net profit is not positive
          if (totalNetProfit <= 0) {
            continue;
          }

          // Calculate annualized ROI
          const annualizedROI = (totalNetProfit / principal) * (365 / DTE);

          const action = `Buy ${pos.candidate} ${pos.position} on ${pos.market} at ${pos.price} and ${comp.candidate} ${comp.position} on ${comp.market} at ${comp.price}`;
          const market = `${pos.market} and ${comp.market}`;
          const description = `Arbitrage opportunity by buying ${pos.candidate} ${pos.position} on ${pos.market} and ${comp.candidate} ${comp.position} on ${comp.market}`;

          results.push({
            market,
            action,
            profitPerContract: netProfitPerContract.toFixed(2),
            perContractFees: perContractFeeTotal.toFixed(2),
            perTransactionFees: perTransactionFeeTotal.toFixed(2),
            netProfitPerContract: netProfitPerContract.toFixed(2),
            numberOfContracts,
            totalNetProfit: totalNetProfit.toFixed(2),
            annualizedROI: (annualizedROI * 100).toFixed(2) + '%',
            description,
          });
        }
      }
    }

    const uniqueResults = Array.from(
      new Map(results.map((item) => [item.action, item])).values()
    );

    return { results: uniqueResults };
  }

  const positions = generatePositions(markets);
  const arbitrageResponse = findArbitrage(positions);
  return arbitrageResponse;
}