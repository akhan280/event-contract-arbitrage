import React from 'react';
import { Coffee } from 'lucide-react';
import Icon from "./icon";

type BrokerType = 'Polymarket' | 'Kalshi' | 'Robinhood';

const brokerLogos: Record<BrokerType, string> = {
  Polymarket: "/polymarket.png",
  Kalshi: "/kalshi.jpg",
  Robinhood: "/robinhood.png",
};

export default function Header() {
  return (
    <div className="w-full bg-gradient-to-b from-white to-slate-50 border-b">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Main Title Section */}
        <div className="flex items-center gap-2 mb-2">
          <Icon />
          <h1 className="text-2xl font-bold text-gray-900">
            Event Contract Arbitrage Calculator
          </h1>
        </div>

        {/* Description Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-col gap-">
            <p className="text-lg text-gray-600 leading-relaxed">
              Leverage price discrepancies in prediction markets like{' '}
              <span className="inline-flex items-center gap-2">
                {Object.entries(brokerLogos).map(([broker, logo], index) => (
                  <React.Fragment key={broker}>
                    <span className="inline-flex items-center">
                      <img
                        src={logo}
                        alt={`${broker} logo`}
                        className="w-6 h-6 rounded-full object-cover border border-gray-200 align-middle"
                      />
                      <span className="ml-1 font-medium text-gray-800">
                        {broker}
                      </span>
                    </span>
                    {index < Object.keys(brokerLogos).length - 1 && (
                      <span className="text-gray-400">,</span>
                    )}
                  </React.Fragment>
                ))}
              </span>{' '}
              <br></br>
              <br></br>

              Examine opportunity cost, spreads with fees included, and more. If this was helpful, <a className='underline' href="https://buymeacoffee.com/areebkhan2c">consider buying us a coffee</a>.
              </p>

          </div>
        </div>
      </div>
    </div>
  );
}
