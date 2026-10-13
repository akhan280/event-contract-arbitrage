import { z } from "zod";

const price = z.number().min(0).max(100);
const label = z.string().max(200);

const optionSchema = z.object({
  id: z.string().max(64),
  name: label,
  prices: z.object({
    buy: z.object({ yes: price, no: price }),
    sell: z.object({ yes: price, no: price }),
  }),
});

const marketSchema = z.object({
  id: z.string().max(64),
  title: label,
  broker: z.enum(["Polymarket", "Kalshi", "Robinhood"]),
  type: z.enum(["binary", "multi"]),
  options: z.array(optionSchema).min(1).max(20),
});

const resultSchema = z.object({
  market: label,
  action: z.string().max(1000),
  profitPerContract: z.string().max(32),
  netProfitPerContract: z.string().max(32),
  numberOfContracts: z.number(),
  totalNetProfit: z.string().max(32),
  annualizedROI: z.string().max(32),
  perContractFees: z.string().max(32),
  perTransactionFees: z.string().max(32),
  description: z.string().max(1000),
});

export const shareSchema = z.object({
  markets: z.array(marketSchema).min(1).max(10),
  dte: z.number().int().min(0).max(3650),
  principal: z.number().min(0).max(1_000_000_000),
  outcome: z.object({ results: z.array(resultSchema).max(500) }).nullable(),
});

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export const supportSchema = z.object({
  name: z.string().trim().min(2).max(100),
  message: z.string().trim().min(2).max(5000),
});
