import { useCallback, useState } from "react";
import { Broker, Market, MarketType, Opportunity, Option, CalculationInput } from "@/lib/types";
import { findArbitrage } from "@/lib/arbitrage";
import { LiveQuote, MAX_OPTIONS } from "@/lib/quotes";

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

const norm = (name: string) => name.trim().toLowerCase();

/** Finds the quote option for one of our option names: exact match first, then one name inside the other. */
function matchOption(name: string, options: LiveQuote["options"]) {
  const exact = options.find((o) => norm(o.name) === norm(name));
  if (exact || !norm(name)) return exact;
  const partial = options.filter((o) => norm(o.name).includes(norm(name)) || norm(name).includes(norm(o.name)));
  return partial.length === 1 ? partial[0] : undefined;
}

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

  /**
   * Fills one venue card from live prices. The first card also sets the title, the type, and
   * the option names. Returns an error, or notes for the user.
   */
  const applyQuote = (marketId: string, quote: LiveQuote): { error?: string; notes: string[] } => {
    const notes: string[] = [];
    const isFirst = markets[0].id === marketId;
    const quoteType: MarketType = quote.options.length === 1 ? "binary" : "multi";
    if (quote.truncated) {
      notes.push(`Only the ${MAX_OPTIONS} most likely options are shown, so "Yes on every option" results are not safe.`);
    }

    if (isFirst) {
      const names = quoteType === "binary" ? [""] : quote.options.map((o) => o.name);
      if (!marketTitle.trim()) setMarketTitle(quote.title);
      setMarketTypeState(quoteType);
      setMarkets((ms) =>
        ms.map((m, i) => {
          if (i === 0) {
            return {
              ...m,
              broker: quote.broker,
              type: quoteType,
              options: quote.options.map((o, j) => ({ id: newId(), name: names[j], prices: { yes: o.yes, no: o.no } })),
            };
          }
          // Other cards keep the prices whose option still exists.
          const keep = (name: string) =>
            m.type !== quoteType ? undefined : quoteType === "binary" ? m.options[0]?.prices : m.options.find((o) => norm(o.name) === norm(name))?.prices;
          return { ...m, type: quoteType, options: names.map((name) => ({ id: newId(), name, prices: keep(name) ?? { yes: 0, no: 0 } })) };
        })
      );
      return { notes };
    }

    if (marketType === "binary") {
      if (quoteType !== "binary") {
        return { error: "This link has several options. Paste the link of one market, or switch to Multiple Choice.", notes };
      }
      const [{ yes, no }] = quote.options;
      setMarkets((ms) =>
        ms.map((m) => (m.id === marketId ? { ...m, broker: quote.broker, options: [{ ...m.options[0], prices: { yes, no } }] } : m))
      );
      notes.push("Check that Yes means the same thing on each venue.");
      return { notes };
    }

    const missing = optionNames.filter((name) => !matchOption(name, quote.options));
    const extra = quote.options.filter((o) => !optionNames.some((name) => matchOption(name, [o])));
    if (missing.length) notes.push(`No ${quote.broker} price for: ${missing.join(", ")}.`);
    if (extra.length) notes.push(`${quote.broker} also lists: ${extra.map((o) => o.name).join(", ")}.`);
    setMarkets((ms) =>
      ms.map((m) =>
        m.id !== marketId
          ? m
          : {
              ...m,
              broker: quote.broker,
              options: m.options.map((o) => {
                const match = matchOption(o.name, quote.options);
                return match ? { ...o, prices: { yes: match.yes, no: match.no } } : o;
              }),
            }
      )
    );
    return { notes };
  };

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
    applyQuote,
    missingRequirement,
    calculate,
    load,
  };
}
