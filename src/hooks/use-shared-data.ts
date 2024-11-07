import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArbitrageResponse, Market } from "../lib/types";

export const useSharedData = (
  setMarkets: (markets: Market[]) => void,
  setDte: (dte: number) => void,
  setPrincipal: (principal: number) => void,
  setOutcome: (outcome: ArbitrageResponse | null) => void,
  setMarketTitle: (title: string) => void
) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const sharedData = searchParams.get("share");

    if (sharedData) {
      try {
        const decodedData = JSON.parse(atob(sharedData));

        // Set all the state from the shared data
        setMarkets(decodedData.markets);
        setDte(decodedData.dte);
        setPrincipal(decodedData.principal);
        setOutcome(decodedData.outcome);

        // Set the market title if available
        if (decodedData.markets?.[0]?.title) {
          setMarketTitle(decodedData.markets[0].title);
        }
      } catch (error) {
        console.error("Error loading shared data:", error);
      }
    }
  }, [searchParams]);
};
