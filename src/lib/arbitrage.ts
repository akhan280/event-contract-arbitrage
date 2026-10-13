// Pure arbitrage math. Type-only imports keep this file runnable by `node --test`.
import type { Broker, CalculationInput, Leg, Market, Opportunity, OpportunityKind } from "./types";

/**
 * Taker fees per venue, in dollars, for `contracts` contracts at `price` dollars each.
 * Check these against each venue's current fee schedule.
 */
export const FEE_RULES: Record<Broker, { label: string; fee: (contracts: number, price: number) => number }> = {
  // Kalshi: 0.07 × C × P × (1 − P), rounded up to the next cent per order.
  Kalshi: {
    label: "7% × P × (1 − P) per contract, rounded up per order",
    fee: (c, p) => roundUpToCent(0.07 * c * p * (1 - p)),
  },
  // Robinhood: $0.01 commission + $0.01 exchange fee per contract.
  Robinhood: {
    label: "$0.02 per contract",
    fee: (c) => 0.02 * c,
  },
  // Polymarket: no trading fee on most markets, and the relayer pays gas.
  Polymarket: {
    label: "No trading fee on most markets",
    fee: () => 0,
  },
};

export interface Quote {
  broker: Broker;
  outcome: string;
  side: "Yes" | "No";
  /** Cents. */
  price: number;
}

export function findArbitrage({ markets, principal, dte }: CalculationInput): Opportunity[] {
  if (principal <= 0 || dte < 1) return [];

  const quotes = collectQuotes(markets);
  const outcomes = [...new Set(quotes.map((q) => q.outcome))];
  const isMulti = markets.some((m) => m.type === "multi");
  const results: Opportunity[] = [];

  // 1. Yes and No on the same outcome. One side always pays $1.
  for (const outcome of outcomes) {
    const yes = quotes.filter((q) => q.outcome === outcome && q.side === "Yes");
    const no = quotes.filter((q) => q.outcome === outcome && q.side === "No");
    for (const y of yes) {
      for (const n of no) {
        push(results, "yes-no", [y, n], 1, principal, dte, false);
      }
    }
  }

  // 2 and 3 need at least two outcomes, each with a quote on that side.
  if (isMulti && outcomes.length >= 2) {
    // 2. Yes on every outcome. Exactly one outcome wins, so the set pays $1.
    const allYes = cheapestPerOutcome(quotes, outcomes, "Yes");
    if (allYes) push(results, "all-yes", allYes, 1, principal, dte, true);

    // 3. No on every outcome. Every outcome but the winner pays, so the set pays $(N − 1).
    const allNo = cheapestPerOutcome(quotes, outcomes, "No");
    if (allNo) push(results, "all-no", allNo, outcomes.length - 1, principal, dte, true);
  }

  return results.sort((a, b) => b.profit - a.profit);
}

/** Cost of buying `contracts` of every leg, in dollars. */
export function setCost(legs: Quote[], contracts: number): { cost: number; fees: number[] } {
  const fees = legs.map((l) => FEE_RULES[l.broker].fee(contracts, l.price / 100));
  const prices = legs.reduce((sum, l) => sum + (contracts * l.price) / 100, 0);
  return { cost: prices + fees.reduce((a, b) => a + b, 0), fees };
}

/** The most sets that fit in `principal`, after fees. */
export function maxContracts(legs: Quote[], principal: number): number {
  const pricePerSet = legs.reduce((s, l) => s + l.price / 100, 0);
  if (pricePerSet <= 0) return 0;
  // Cost rises with size. Fees are not linear (per-order rounding), so binary search.
  let lo = 0;
  let hi = Math.floor(principal / pricePerSet);
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (setCost(legs, mid).cost <= principal + 1e-9) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function push(
  results: Opportunity[],
  kind: OpportunityKind,
  quotes: Quote[],
  payoutPerSet: number,
  principal: number,
  dte: number,
  requiresExhaustiveOptions: boolean
) {
  if (quotes.reduce((s, q) => s + q.price, 0) >= payoutPerSet * 100) return;

  const contracts = maxContracts(quotes, principal);
  if (contracts < 1) return;

  const { cost, fees } = setCost(quotes, contracts);
  const payout = contracts * payoutPerSet;
  const profit = round2(payout - cost);
  if (profit <= 0) return;

  const legs: Leg[] = quotes.map((q, i) => ({ ...q, fees: round2(fees[i]) }));
  const returnPct = profit / cost;

  results.push({
    id: `${kind}:${legs.map((l) => `${l.broker}-${l.outcome}-${l.side}`).join("|")}`,
    kind,
    legs,
    contracts,
    totalCost: round2(cost),
    totalFees: round2(fees.reduce((a, b) => a + b, 0)),
    payout: round2(payout),
    profit,
    returnPct,
    annualizedPct: returnPct * (365 / dte),
    requiresExhaustiveOptions,
  });
}

function collectQuotes(markets: Market[]): Quote[] {
  const quotes: Quote[] = [];
  for (const market of markets) {
    for (const option of market.options) {
      const outcome = (market.type === "binary" ? market.title : option.name).trim();
      if (!outcome) continue;
      // A blank price is 0. Skip it: it is a missing quote, not a free contract.
      if (option.prices.yes > 0) quotes.push({ broker: market.broker, outcome, side: "Yes", price: option.prices.yes });
      if (option.prices.no > 0) quotes.push({ broker: market.broker, outcome, side: "No", price: option.prices.no });
    }
  }
  return quotes;
}

function cheapestPerOutcome(quotes: Quote[], outcomes: string[], side: "Yes" | "No"): Quote[] | null {
  const picks: Quote[] = [];
  for (const outcome of outcomes) {
    const options = quotes.filter((q) => q.outcome === outcome && q.side === side);
    if (options.length === 0) return null;
    picks.push(options.reduce((best, q) => (setCost([q], 100).cost < setCost([best], 100).cost ? q : best)));
  }
  return picks;
}

function roundUpToCent(dollars: number): number {
  return Math.ceil(dollars * 100 - 1e-9) / 100;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
