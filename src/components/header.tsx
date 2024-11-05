import Icon from "./icon";

export default function Header() {
    return(
        <div className="flex flex-col justify-start p-6 gap-3 bg-slate-400/5">
            
            <div className="flex flex-row items-center gap-2">
              <Icon></Icon>
              <div className="text-[22px]">
                Event Contract Arbitrage Calculator
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-gray-700">
                Leverage price discrepancies in prediction markets like Kalshi,
                Polymarket, Robinhood and more for guaranteed profit. Examine opportunity cost, spreads with fees included and more.
              </div>
              <div className="text-gray-700">
                If this was helpful for you, <a href="https://buymeacoffee.com/areebkhan2c"><u>please consider buying us a coffee!</u></a>
              </div>
            </div>

          </div>
    )
}