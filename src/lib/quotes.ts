// Reads live ask prices from public Kalshi and Polymarket APIs.
// Parsing is pure and has tests. Only the fetch* functions touch the network.

export interface LiveQuote {
  broker: "Kalshi" | "Polymarket";
  title: string;
  /** One option means a binary market. Prices are ask prices in cents; 0 means no ask. */
  options: { name: string; yes: number; no: number }[];
  /** True when the event had more options than MAX_OPTIONS. */
  truncated: boolean;
}

export type QuoteSource =
  | { broker: "Kalshi"; ticker: string }
  | { broker: "Polymarket"; eventSlug: string | null; marketSlug: string | null };

export const MAX_OPTIONS = 20;

const KALSHI_API = "https://api.elections.kalshi.com/trade-api/v2";
const POLYMARKET_API = "https://gamma-api.polymarket.com";
const TICKER = /^[A-Z0-9][A-Z0-9._-]{0,79}$/;
const SLUG = /^[a-z0-9][a-z0-9-]{0,199}$/;

export class QuoteError extends Error {}

/** Turns a pasted venue link into IDs. Only these IDs ever reach a URL that we fetch. */
export function parseVenueUrl(input: string): QuoteSource {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new QuoteError("Paste a full Kalshi or Polymarket link.");
  }
  const host = url.hostname.replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "kalshi.com") {
    // kalshi.com/markets/<series>[/<slug>[/<event>]]: the last part is the most specific ticker.
    const ticker = parts[0] === "markets" ? parts[parts.length - 1]?.toUpperCase() : undefined;
    if (!ticker || !TICKER.test(ticker)) throw new QuoteError("Could not find a market in this Kalshi link.");
    return { broker: "Kalshi", ticker };
  }

  if (host === "polymarket.com") {
    // polymarket.com/event/<event>[/<market>] or polymarket.com/market/<market>
    const [kind, first, second] = parts;
    const eventSlug = kind === "event" ? first : null;
    const marketSlug = kind === "event" ? (second ?? null) : kind === "market" ? first : null;
    for (const slug of [eventSlug, marketSlug]) {
      if (slug !== null && !SLUG.test(slug)) throw new QuoteError("Could not read this Polymarket link.");
    }
    if (!eventSlug && !marketSlug) throw new QuoteError("Could not find a market in this Polymarket link.");
    return { broker: "Polymarket", eventSlug, marketSlug };
  }

  throw new QuoteError("Only Kalshi and Polymarket links have live prices.");
}

// ---------- Kalshi ----------

export interface KalshiMarket {
  ticker: string;
  title: string;
  yes_sub_title?: string;
  status: string;
  yes_ask_dollars?: string;
  no_ask_dollars?: string;
}

export interface KalshiEvent {
  event_ticker: string;
  title: string;
  mutually_exclusive: boolean;
  markets?: KalshiMarket[];
}

const kalshiCents = (dollars?: string) => {
  const n = parseFloat(dollars ?? "");
  return n > 0 && n < 1 ? round2(n * 100) : 0;
};

export function kalshiEventToQuote(event: KalshiEvent): LiveQuote {
  const markets = (event.markets ?? []).filter((m) => m.status === "active");
  if (markets.length === 0) throw new QuoteError("This Kalshi event has no open markets.");
  if (markets.length === 1) return kalshiMarketToQuote(markets[0], event.title);
  if (!event.mutually_exclusive) {
    throw new QuoteError("The options in this Kalshi event can all win at the same time. Paste one market's link.");
  }
  return limit({
    broker: "Kalshi",
    title: event.title,
    options: markets.map((m) => ({
      name: m.yes_sub_title || m.title,
      yes: kalshiCents(m.yes_ask_dollars),
      no: kalshiCents(m.no_ask_dollars),
    })),
  });
}

export function kalshiMarketToQuote(market: KalshiMarket, title = market.title): LiveQuote {
  return {
    broker: "Kalshi",
    title,
    options: [{ name: title, yes: kalshiCents(market.yes_ask_dollars), no: kalshiCents(market.no_ask_dollars) }],
    truncated: false,
  };
}

async function fetchKalshi(ticker: string): Promise<LiveQuote> {
  // The ticker can be an event, a market, or a series. Try each, most specific first.
  const event = await getJson<{ event: KalshiEvent; markets?: KalshiMarket[] }>(
    `${KALSHI_API}/events/${ticker}?with_nested_markets=true`
  );
  if (event) return kalshiEventToQuote({ ...event.event, markets: event.event.markets ?? event.markets });

  const market = await getJson<{ market: KalshiMarket }>(`${KALSHI_API}/markets/${ticker}`);
  if (market) return kalshiMarketToQuote(market.market);

  const series = await getJson<{ events: KalshiEvent[] }>(
    `${KALSHI_API}/events?series_ticker=${ticker}&status=open&with_nested_markets=true&limit=2`
  );
  if (series?.events.length === 1) return kalshiEventToQuote(series.events[0]);
  if (series && series.events.length > 1) {
    throw new QuoteError("This Kalshi link covers more than one event. Open one event and paste its link.");
  }
  throw new QuoteError("Kalshi has no open market for this link.");
}

// ---------- Polymarket ----------

export interface PolymarketMarket {
  slug: string;
  question: string;
  groupItemTitle?: string;
  outcomes?: string;
  active: boolean;
  closed: boolean;
  bestAsk?: number;
  bestBid?: number;
}

export interface PolymarketEvent {
  slug: string;
  title: string;
  negRisk?: boolean;
  markets?: PolymarketMarket[];
}

/** Yes is the first outcome token. Its ask is bestAsk. The No ask is 1 − the Yes bid. */
const polymarketPrices = (m: PolymarketMarket) => ({
  yes: m.bestAsk && m.bestAsk > 0 && m.bestAsk < 1 ? round2(m.bestAsk * 100) : 0,
  no: m.bestBid && m.bestBid > 0 && m.bestBid < 1 ? round2((1 - m.bestBid) * 100) : 0,
});

export function polymarketMarketToQuote(m: PolymarketMarket, title = m.question): LiveQuote {
  let name = title;
  try {
    const outcomes = JSON.parse(m.outcomes ?? "[]") as string[];
    // Sports markets use team names, not Yes/No. Say which side is "Yes".
    if (outcomes.length === 2 && outcomes[0] !== "Yes") name = `${title} (Yes = ${outcomes[0]}, No = ${outcomes[1]})`;
  } catch {
    // Keep the title.
  }
  return { broker: "Polymarket", title: name, options: [{ name, ...polymarketPrices(m) }], truncated: false };
}

export function polymarketEventToQuote(event: PolymarketEvent, marketSlug: string | null): LiveQuote {
  const open = (event.markets ?? []).filter((m) => m.active && !m.closed);
  const chosen = marketSlug ? open.find((m) => m.slug === marketSlug) : undefined;
  if (marketSlug && !chosen) throw new QuoteError("This Polymarket market is closed or does not exist.");
  if (chosen) return polymarketMarketToQuote(chosen);
  if (open.length === 0) throw new QuoteError("This Polymarket event has no open markets.");
  if (open.length === 1) return polymarketMarketToQuote(open[0], event.title);

  if (!event.negRisk) {
    // Events such as sports games hold many separate markets. The main one shares the event slug.
    const main = open.find((m) => m.slug === event.slug);
    if (main) return polymarketMarketToQuote(main);
    throw new QuoteError("This Polymarket event has many separate markets. Open one market and paste its link.");
  }

  return limit({
    broker: "Polymarket",
    title: event.title,
    options: open.map((m) => ({ name: m.groupItemTitle || m.question, ...polymarketPrices(m) })),
  });
}

async function fetchPolymarket(eventSlug: string | null, marketSlug: string | null): Promise<LiveQuote> {
  if (eventSlug) {
    const events = await getJson<PolymarketEvent[]>(`${POLYMARKET_API}/events?slug=${eventSlug}`);
    if (events?.[0]) return polymarketEventToQuote(events[0], marketSlug);
  }
  if (marketSlug) {
    const markets = await getJson<PolymarketMarket[]>(`${POLYMARKET_API}/markets?slug=${marketSlug}`);
    const m = markets?.[0];
    if (m && m.active && !m.closed) return polymarketMarketToQuote(m);
  }
  throw new QuoteError("Polymarket has no open market for this link.");
}

// ---------- shared ----------

export function fetchQuote(source: QuoteSource): Promise<LiveQuote> {
  return source.broker === "Kalshi" ? fetchKalshi(source.ticker) : fetchPolymarket(source.eventSlug, source.marketSlug);
}

/** Keeps the MAX_OPTIONS most likely options (highest Yes ask). */
function limit(quote: Omit<LiveQuote, "truncated">): LiveQuote {
  return {
    ...quote,
    options: [...quote.options].sort((a, b) => b.yes - a.yes).slice(0, MAX_OPTIONS),
    truncated: quote.options.length > MAX_OPTIONS,
  };
}

/** Returns null on 404 so callers can try the next lookup. */
async function getJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new QuoteError(`The venue API returned ${res.status}. Try again soon.`);
  return (await res.json()) as T;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
