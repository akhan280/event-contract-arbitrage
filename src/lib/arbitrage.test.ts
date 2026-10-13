import { test } from "node:test";
import assert from "node:assert/strict";
import { FEE_RULES, findArbitrage, maxContracts, setCost } from "./arbitrage.ts";
import type { Broker, Market } from "./types";

let nextId = 0;
const binary = (broker: Broker, yes: number, no: number, title = "Fed cuts in December"): Market => ({
  id: String(++nextId),
  title,
  broker,
  type: "binary",
  options: [{ id: String(++nextId), name: title, prices: { yes, no } }],
});

const multi = (broker: Broker, prices: Record<string, [number, number]>): Market => ({
  id: String(++nextId),
  title: "Election winner",
  broker,
  type: "multi",
  options: Object.entries(prices).map(([name, [yes, no]]) => ({ id: String(++nextId), name, prices: { yes, no } })),
});

test("Kalshi fee is 7% × P × (1 − P), rounded up per order", () => {
  assert.equal(FEE_RULES.Kalshi.fee(100, 0.4), 1.68);
  assert.equal(FEE_RULES.Kalshi.fee(1, 0.5), 0.02); // 0.0175 rounds up
});

test("prices are cents and money is dollars", () => {
  const [opp] = findArbitrage({ markets: [binary("Polymarket", 40, 55)], principal: 95, dte: 30 });
  assert.equal(opp.contracts, 100);
  assert.equal(opp.totalCost, 95);
  assert.equal(opp.payout, 100);
  assert.equal(opp.profit, 5);
  assert.ok(Math.abs(opp.annualizedPct - (5 / 95) * (365 / 30)) < 1e-9);
});

test("Kalshi fees reduce size and profit", () => {
  const markets = [binary("Kalshi", 40, 60), binary("Kalshi", 60, 55)];
  const results = findArbitrage({ markets, principal: 1000, dte: 30 });
  assert.equal(results.length, 1, "one trade, not the same trade twice in reverse order");
  const [opp] = results;
  const legs = opp.legs.map(({ broker, outcome, side, price }) => ({ broker, outcome, side, price }));
  assert.ok(setCost(legs, opp.contracts).cost <= 1000);
  assert.ok(setCost(legs, opp.contracts + 1).cost > 1000);
  assert.equal(opp.contracts, maxContracts(legs, 1000));
  assert.ok(opp.contracts > 1000 && opp.contracts < 1052, `got ${opp.contracts}`);
  assert.ok(opp.totalFees > 30, `fees ${opp.totalFees}`);
  assert.ok(opp.profit > 0 && opp.profit < 20, `profit ${opp.profit}`);
});

test("a blank price is a missing quote, not a 0¢ contract", () => {
  assert.deepEqual(findArbitrage({ markets: [binary("Polymarket", 40, 0)], principal: 100, dte: 10 }), []);
});

test("no result when Yes + No costs 100¢ or more", () => {
  assert.deepEqual(findArbitrage({ markets: [binary("Polymarket", 45, 55)], principal: 100, dte: 10 }), []);
});

test("fees can remove a thin spread", () => {
  assert.deepEqual(findArbitrage({ markets: [binary("Kalshi", 49, 50)], principal: 1000, dte: 10 }), []);
});

test("Yes on two of three outcomes is not an arbitrage", () => {
  const markets = [multi("Polymarket", { A: [30, 0], B: [30, 0], C: [45, 0] }), multi("Kalshi", { A: [25, 0], B: [35, 0], C: [50, 0] })];
  const results = findArbitrage({ markets, principal: 1000, dte: 30 });
  assert.equal(results.length, 0, "30 + 25 + 45 = 100¢ for all three; any pair is a bet, not an arbitrage");
});

test("Yes on every outcome, cheapest venue each", () => {
  const markets = [multi("Polymarket", { A: [30, 0], B: [35, 0], C: [30, 0] }), multi("Robinhood", { A: [28, 0], B: [40, 0], C: [40, 0] })];
  const [opp] = findArbitrage({ markets, principal: 1000, dte: 30 });
  assert.equal(opp.kind, "all-yes");
  assert.equal(opp.requiresExhaustiveOptions, true);
  assert.deepEqual(
    opp.legs.map((l) => `${l.broker} ${l.outcome} ${l.price}`),
    // Robinhood A is 28¢ + 2¢ fee = 30¢, a tie with Polymarket, so Polymarket stays.
    ["Polymarket A 30", "Polymarket B 35", "Polymarket C 30"]
  );
  assert.equal(opp.payout, opp.contracts);
});

test("No on every outcome pays N − 1 per set", () => {
  const markets = [multi("Polymarket", { A: [0, 60], B: [0, 60], C: [0, 60] })];
  const [opp] = findArbitrage({ markets, principal: 180, dte: 30 });
  assert.equal(opp.kind, "all-no");
  assert.equal(opp.contracts, 100);
  assert.equal(opp.payout, 200);
  assert.equal(opp.profit, 20);
});

test("results are sorted by profit", () => {
  const markets = [binary("Polymarket", 40, 58), binary("Polymarket", 45, 50)];
  const results = findArbitrage({ markets, principal: 1000, dte: 30 });
  assert.ok(results.length > 1);
  for (let i = 1; i < results.length; i++) assert.ok(results[i - 1].profit >= results[i].profit);
});

test("needs principal and at least one day", () => {
  const markets = [binary("Polymarket", 40, 55)];
  assert.deepEqual(findArbitrage({ markets, principal: 0, dte: 30 }), []);
  assert.deepEqual(findArbitrage({ markets, principal: 100, dte: 0 }), []);
});
