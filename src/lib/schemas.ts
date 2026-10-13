import { z } from "zod";

const price = z.number().min(0).max(100);
const label = z.string().max(200);

// Shares made before the sell prices were removed store { buy: { yes, no }, sell }.
const pricesSchema = z.preprocess(
  (p) => (p && typeof p === "object" && "buy" in p ? (p as { buy: unknown }).buy : p),
  z.object({ yes: price, no: price })
);

const optionSchema = z.object({
  id: z.string().max(64),
  name: label,
  prices: pricesSchema,
});

const marketSchema = z.object({
  id: z.string().max(64),
  title: label,
  broker: z.enum(["Polymarket", "Kalshi", "Robinhood"]),
  type: z.enum(["binary", "multi"]),
  options: z.array(optionSchema).min(1).max(20),
});

// Inputs only. The page recomputes results when it loads a share.
export const shareSchema = z.object({
  markets: z.array(marketSchema).min(1).max(10),
  dte: z.number().int().min(0).max(3650),
  principal: z.number().min(0).max(1_000_000_000),
});

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export const supportSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  message: z.string().trim().min(2, "Message must be at least 2 characters.").max(5000),
});
