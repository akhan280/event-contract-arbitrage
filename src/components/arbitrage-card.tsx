import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Info, Percent } from "lucide-react";
import Icon from "./icon";

type BrokerType = "Polymarket" | "Kalshi" | "Robinhood";

const brokerLogos: Record<BrokerType, string> = {
  Polymarket: "/polymarket.png",
  Kalshi: "/kalshi.jpg",
  Robinhood: "/robinhood.png",
};

const ArbitrageCard = ({ result }: any) => {
  const brokers = result.market.split(" and ") as BrokerType[];

  return (
    <Card className="w-full max-w-xl bg-white shadow-lg">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon></Icon>
            <span>
              {brokers[0] === brokers[1] ? brokers[0] : `${brokers[0]} x ${brokers[1]}`} Arbitrage
            </span>
          </div>
          <div className="flex items-center gap-2">
            {brokers.map((broker, index) => (
              <React.Fragment key={broker}>
                <img
                  src={brokerLogos[broker]}
                  alt={`${broker} logo`}
                  className="h-8 w-8 object-contain rounded-full"
                />
                {index < brokers.length - 1 && (
                  <span className="text-gray-400 outline-1">x</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Action Section */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm text-blue-600 font-medium mb-2">
            POTENTIAL ACTION
          </h3>
          <p className="text-gray-700">{result.action}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <DollarSign size={14} />
              Total Net Profit
            </div>
            <p className="text-2xl font-bold text-green-600">
              ${parseFloat(result.totalNetProfit).toFixed(2)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Percent size={14} />
              Annualized ROI
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {result.annualizedROI}
            </p>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm text-gray-500 font-medium flex items-center gap-1">
            <Info size={14} />
            TRADE DETAILS
          </h3>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Profit per Contract</span>
              <span className="font-medium">${result.profitPerContract}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Number of Contracts</span>
              <span className="font-medium">{result.numberOfContracts}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Transaction Fees</span>
              <span className="font-medium">${result.perTransactionFees}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Contract Fees</span>
              <span className="font-medium">${result.perContractFees}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">{result.description}</p>
        </div>

        <div>
            
        </div>
      </CardContent>
    </Card>
  );
};

export default ArbitrageCard;
