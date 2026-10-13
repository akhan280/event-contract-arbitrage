import { test } from "node:test";
import assert from "node:assert/strict";
import {
  kalshiEventToQuote,
  parseVenueUrl,
  polymarketEventToQuote,
  QuoteError,
  type KalshiMarket,
  type PolymarketMarket,
} from "./quotes.ts";

test("parses Kalshi links to the most specific ticker", () => {
  assert.deepEqual(parseVenueUrl("https://kalshi.com/markets/kxnextnatosecgen/next-nato/kxnextnatosecgen-99"), {
    broker: "Kalshi",
    ticker: "KXNEXTNATOSECGEN-99",
  });
  assert.deepEqual(parseVenueUrl("https://kalshi.com/markets/kxfed"), { broker: "Kalshi", ticker: "KXFED" });
});

test("parses Polymarket event, market, and nested market links", () => {
  assert.deepEqual(parseVenueUrl("https://polymarket.com/event/fed-decision?tid=1"), {
    broker: "Polymarket",
    eventSlug: "fed-decision",
    marketSlug: null,
  });
  assert.deepEqual(parseVenueUrl("https://www.polymarket.com/event/fed-decision/no-change"), {
    broker: "Polymarket",
    eventSlug: "fed-decision",
    marketSlug: "no-change",
  });
  assert.deepEqual(parseVenueUrl("https://polymarket.com/market/no-change"), {
    broker: "Polymarket",
    eventSlug: null,
    marketSlug: "no-change",
  });
});

test("rejects other hosts and odd paths", () => {
  for (const bad of [
    "not a url",
    "https://evil.example/markets/x",
    "https://kalshi.com/portfolio",
    "https://polymarket.com/event/..%2F..%2Fadmin",
    "https://kalshi.com.evil.example/markets/x",
  ]) {
    assert.throws(() => parseVenueUrl(bad), QuoteError, bad);
  }
});

const km = (sub: string, yes: string, no: string, status = "active"): KalshiMarket => ({
  ticker: `T-${sub}`,
  title: `Will ${sub} win?`,
  yes_sub_title: sub,
  status,
  yes_ask_dollars: yes,
  no_ask_dollars: no,
});

test("Kalshi multi-outcome event becomes options in cents", () => {
  const quote = kalshiEventToQuote({
    event_ticker: "E",
    title: "Next NATO chief?",
    mutually_exclusive: true,
    markets: [km("Kallas", "0.4400", "0.7300"), km("Wallace", "0.0500", "0.9900"), km("Old", "0.1", "0.9", "settled")],
  });
  assert.equal(quote.title, "Next NATO chief?");
  assert.deepEqual(quote.options, [
    { name: "Kallas", yes: 44, no: 73 },
    { name: "Wallace", yes: 5, no: 99 },
  ]);
});

test("Kalshi single-market event is binary, and a missing ask is 0", () => {
  const quote = kalshiEventToQuote({ event_ticker: "E", title: "Mars?", mutually_exclusive: false, markets: [km("Mars", "0.1200", "")] });
  assert.deepEqual(quote.options, [{ name: "Mars?", yes: 12, no: 0 }]);
});

test("Kalshi events whose options can all win are rejected", () => {
  assert.throws(
    () => kalshiEventToQuote({ event_ticker: "E", title: "X", mutually_exclusive: false, markets: [km("A", "0.5", "0.5"), km("B", "0.5", "0.5")] }),
    QuoteError
  );
});

const pm = (slug: string, title: string, ask: number, bid: number, extra: Partial<PolymarketMarket> = {}): PolymarketMarket => ({
  slug,
  question: `Will ${title}?`,
  groupItemTitle: title,
  outcomes: '["Yes", "No"]',
  active: true,
  closed: false,
  bestAsk: ask,
  bestBid: bid,
  ...extra,
});

test("Polymarket negRisk event becomes options; No ask is 1 − Yes bid", () => {
  const quote = polymarketEventToQuote(
    {
      slug: "fed",
      title: "Fed decision?",
      negRisk: true,
      markets: [pm("cut", "25 bps cut", 0.006, 0.005), pm("hold", "No change", 0.81, 0.8), pm("x", "Gone", 0.5, 0.4, { closed: true })],
    },
    null
  );
  assert.deepEqual(quote.options, [
    { name: "No change", yes: 81, no: 20 },
    { name: "25 bps cut", yes: 0.6, no: 99.5 },
  ]);
});

test("Polymarket nested market link picks that market", () => {
  const quote = polymarketEventToQuote(
    { slug: "fed", title: "Fed decision?", negRisk: true, markets: [pm("cut", "25 bps cut", 0.006, 0.005), pm("hold", "No change", 0.81, 0.8)] },
    "hold"
  );
  assert.deepEqual(quote.options, [{ name: "Will No change?", yes: 81, no: 20 }]);
});

test("Polymarket sports event uses the main market and names the Yes side", () => {
  const quote = polymarketEventToQuote(
    {
      slug: "nfl-buf-la",
      title: "Bills vs. Rams",
      negRisk: false,
      markets: [
        pm("nfl-buf-la", "", 0.45, 0.44, { question: "Bills vs. Rams", outcomes: '["Bills", "Rams"]' }),
        pm("nfl-buf-la-spread", "", 0.5, 0.49, { question: "Spread: Rams (-1.5)", outcomes: '["Rams", "Bills"]' }),
      ],
    },
    null
  );
  assert.deepEqual(quote.options, [{ name: "Bills vs. Rams (Yes = Bills, No = Rams)", yes: 45, no: 56 }]);
});

test("caps options at 20 and keeps the most likely", () => {
  const markets = Array.from({ length: 25 }, (_, i) => pm(`m${i}`, `Option ${i}`, (i + 1) / 100, i / 100));
  const quote = polymarketEventToQuote({ slug: "big", title: "Big", negRisk: true, markets }, null);
  assert.equal(quote.options.length, 20);
  assert.equal(quote.truncated, true);
  assert.equal(quote.options[0].name, "Option 24");
});
