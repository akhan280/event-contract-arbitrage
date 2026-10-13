export type Broker = "Polymarket" | "Kalshi" | "Robinhood";

export const BROKERS: Broker[] = ["Polymarket", "Kalshi", "Robinhood"];

export type MarketType = "binary" | "multi";

/** Ask prices in cents (0–100). 0 means "not entered". */
export interface OptionPrices {
  yes: number;
  no: number;
}

export interface Option {
  id: string;
  name: string;
  prices: OptionPrices;
}

export interface Market {
  id: string;
  title: string;
  broker: Broker;
  type: MarketType;
  options: Option[];
}

export interface CalculationInput {
  markets: Market[];
  /** Days to expiration. */
  dte: number;
  /** Dollars available to deploy. */
  principal: number;
}

export interface Leg {
  broker: Broker;
  outcome: string;
  side: "Yes" | "No";
  /** Price per contract in cents. */
  price: number;
  /** Fees for this leg in dollars. */
  fees: number;
}

export type OpportunityKind = "yes-no" | "all-yes" | "all-no";

export interface Opportunity {
  id: string;
  kind: OpportunityKind;
  legs: Leg[];
  /** Contracts bought on each leg. */
  contracts: number;
  /** Dollars paid for contracts and fees. */
  totalCost: number;
  totalFees: number;
  /** Dollars received at settlement, whatever the result. */
  payout: number;
  profit: number;
  /** profit / totalCost */
  returnPct: number;
  /** Simple (not compounded) annualized return. */
  annualizedPct: number;
  /** True when the trade is safe only if the listed options cover every outcome. */
  requiresExhaustiveOptions: boolean;
}
