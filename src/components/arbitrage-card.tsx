import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Info, Percent, AlertTriangle } from "lucide-react";
import Icon from "./icon";
import { Broker, Opportunity } from "@/lib/types";
import { FEE_RULES } from "@/lib/arbitrage";

const brokerLogos: Record<Broker, string> = {
  Polymarket: "/polymarket.png",
  Kalshi: "/kalshi.jpg",
  Robinhood: "/robinhood.png",
};

const kindLabels: Record<Opportunity["kind"], string> = {
  "yes-no": "Yes + No",
  "all-yes": "Yes on every option",
  "all-no": "No on every option",
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

const ArbitrageCard = ({ opportunity, dte }: { opportunity: Opportunity; dte: number }) => {
  const brokers = [...new Set(opportunity.legs.map((l) => l.broker))];

  return (
    <Card className="w-full bg-white shadow-lg">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon />
            <span>{kindLabels[opportunity.kind]}</span>
          </div>
          <div className="flex items-center gap-2">
            {brokers.map((broker, index) => (
              <React.Fragment key={broker}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brokerLogos[broker]}
                  alt={`${broker} logo`}
                  className="h-8 w-8 object-contain rounded-full"
                />
                {index < brokers.length - 1 && <span className="text-gray-400">x</span>}
              </React.Fragment>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm text-blue-600 font-medium mb-2">
            BUY {opportunity.contracts.toLocaleString()} CONTRACTS OF EACH
          </h3>
          <ul className="text-gray-700 space-y-1">
            {opportunity.legs.map((leg) => (
              <li key={`${leg.broker}-${leg.outcome}-${leg.side}`}>
                <span className="font-medium">
                  {leg.outcome} {leg.side}
                </span>{" "}
                on {leg.broker} at {leg.price}¢
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <DollarSign size={14} />
              Net Profit
            </div>
            <p className="text-2xl font-bold text-green-600">{usd(opportunity.profit)}</p>
            <p className="text-sm text-gray-500">{pct(opportunity.returnPct)} return</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Percent size={14} />
              Annualized
            </div>
            <p className="text-2xl font-bold text-blue-600">{pct(opportunity.annualizedPct)}</p>
            <p className="text-sm text-gray-500">over {dte} days, not compounded</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm text-gray-500 font-medium flex items-center gap-1">
            <Info size={14} />
            TRADE DETAILS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Row label="You pay" value={usd(opportunity.totalCost)} />
            <Row label="You get back" value={usd(opportunity.payout)} />
            <Row label="Fees (included)" value={usd(opportunity.totalFees)} />
            <Row label="Contracts per leg" value={opportunity.contracts.toLocaleString()} />
          </div>
          <p className="text-xs text-gray-500">
            The payout is the same whatever the result. Fees:{" "}
            {brokers.map((b) => `${b}: ${FEE_RULES[b].label}`).join("; ")}.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm text-gray-500 font-medium">PAYOUT BY RESULT</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="font-normal">If</th>
                <th className="font-normal text-right">You get</th>
                <th className="font-normal text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {resultsFor(opportunity).map((label) => (
                <tr key={label} className="border-t">
                  <td className="py-1">{label}</td>
                  <td className="py-1 text-right">{usd(opportunity.payout)}</td>
                  <td className="py-1 text-right text-green-600">{usd(opportunity.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {opportunity.requiresExhaustiveOptions && (
          <div className="flex gap-2 text-sm text-amber-800 bg-amber-50 p-3 rounded-lg">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
            <span>
              This trade is safe only if your options cover every possible result. If an
              unlisted option wins, you can lose money.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/** Every result the trade covers. The payout is the same for each one. */
function resultsFor(opportunity: Opportunity): string[] {
  if (opportunity.kind === "yes-no") {
    const outcome = opportunity.legs[0].outcome;
    return [`${outcome}: Yes`, `${outcome}: No`];
  }
  return opportunity.legs.map((leg) => `${leg.outcome} wins`);
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default ArbitrageCard;
