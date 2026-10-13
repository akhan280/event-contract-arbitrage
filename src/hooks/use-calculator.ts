import { useCallback, useState } from "react";
import { Broker, Market, MarketType, Opportunity, Option, CalculationInput } from "@/lib/types";
import { findArbitrage } from "@/lib/arbitrage";

const newId = () => crypto.randomUUID();

const newOption = (name: string): Option => ({ id: newId(), name, prices: { yes: 0, no: 0 } });

const newMarket = (broker: Broker, type: MarketType, title: string, optionNames: string[]): Market => ({
  id: newId(),
  title,
  broker,
  type,
  options: optionNames.map(newOption),
});

/** Keeps price input to two decimals between 0 and 100 cents. */
export const parsePrice = (value: string): number => {
  const [whole, fraction] = value.replace(/[^\d.]/g, "").split(".");
  const num = parseFloat(whole + (fraction !== undefined ? "." + fraction.slice(0, 2) : "")) || 0;
  return Math.min(Math.max(num, 0), 100);
};

export function useCalculator() {
  const [markets, setMarkets] = useState<Market[]>(() => [newMarket("Polymarket", "binary", "", [""])]);
  const [marketTitle, setMarketTitleState] = useState("");
  const [marketType, setMarketTypeState] = useState<MarketType>("binary");
  const [dte, setDte] = useState(0);
  const [principal, setPrincipal] = useState(0);
  const [results, setResults] = useState<Opportunity[] | null>(null);

  // Every market shares the title, the type, and the option names. Only broker and prices differ.
  const optionNames = markets[0].options.map((o) => o.name);

  const setMarketTitle = (title: string) => {
    setMarketTitleState(title);
    setMarkets((ms) => ms.map((m) => ({ ...m, title })));
  };

  const setMarketType = (type: MarketType) => {
    setMarketTypeState(type);
    const names = type === "multi" ? ["Option 1", "Option 2"] : [""];
    setMarkets((ms) => ms.map((m) => ({ ...m, type, options: names.map(newOption) })));
  };

  const addMarket = () => {
    const used = new Set(markets.map((m) => m.broker));
    const broker = (["Kalshi", "Polymarket", "Robinhood"] as Broker[]).find((b) => !used.has(b)) ?? "Kalshi";
    setMarkets((ms) => [...ms, newMarket(broker, marketType, marketTitle, optionNames)]);
  };

  const removeMarket = (marketId: string) => setMarkets((ms) => ms.filter((m) => m.id !== marketId));

  const setBroker = (marketId: string, broker: Broker) =>
    setMarkets((ms) => ms.map((m) => (m.id === marketId ? { ...m, broker } : m)));

  const addOption = () => {
    const name = `Option ${optionNames.length + 1}`;
    setMarkets((ms) => ms.map((m) => ({ ...m, options: [...m.options, newOption(name)] })));
  };

  const removeOption = (index: number) =>
    setMarkets((ms) => ms.map((m) => ({ ...m, options: m.options.filter((_, i) => i !== index) })));

  const renameOption = (index: number, name: string) =>
    setMarkets((ms) =>
      ms.map((m) => ({ ...m, options: m.options.map((o, i) => (i === index ? { ...o, name } : o)) }))
    );

  const setPrice = (marketId: string, index: number, side: "yes" | "no", value: string) =>
    setMarkets((ms) =>
      ms.map((m) =>
        m.id !== marketId
          ? m
          : {
              ...m,
              options: m.options.map((o, i) =>
                i === index ? { ...o, prices: { ...o.prices, [side]: parsePrice(value) } } : o
              ),
            }
      )
    );

  const missingRequirement = (): string => {
    if (!marketTitle.trim()) return "Enter a market title";
    if (dte < 1) return "Days to expiration must be 1 or more";
    if (principal <= 0) return "Principal must be more than $0";
    if (marketType === "multi") {
      if (optionNames.some((n) => !n.trim())) return "Give every option a name";
      if (new Set(optionNames.map((n) => n.trim().toLowerCase())).size !== optionNames.length) {
        return "Give each option a different name";
      }
    }
    if (!markets.some((m) => m.options.some((o) => o.prices.yes > 0 || o.prices.no > 0))) {
      return "Enter at least one price";
    }
    return "";
  };

  const calculate = (): Opportunity[] => {
    const found = findArbitrage({ markets, dte, principal });
    setResults(found);
    return found;
  };

  /** Replaces all inputs, for example from a shared link, and recomputes the results. */
  const load = useCallback((input: CalculationInput) => {
    setMarkets(input.markets);
    setMarketTitleState(input.markets[0].title);
    setMarketTypeState(input.markets[0].type);
    setDte(input.dte);
    setPrincipal(input.principal);
    setResults(findArbitrage(input));
  }, []);

  return {
    markets,
    marketTitle,
    marketType,
    optionNames,
    dte,
    principal,
    results,
    setMarketTitle,
    setMarketType,
    setDte,
    setPrincipal,
    addMarket,
    removeMarket,
    setBroker,
    addOption,
    removeOption,
    renameOption,
    setPrice,
    missingRequirement,
    calculate,
    load,
  };
}
