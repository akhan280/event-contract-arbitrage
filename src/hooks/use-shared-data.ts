import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Market, MarketType, Opportunity } from "../lib/types";
import { findArbitrage } from "../lib/arbitrage";
import { shareSchema } from "../lib/schemas";
import { toast } from "../hooks/use-toast";

interface SharedDataLoaderProps {
  setMarkets: (markets: Market[]) => void;
  setDte: (dte: number) => void;
  setPrincipal: (principal: number) => void;
  setOutcome: (outcome: Opportunity[] | null) => void;
  setGlobalMarketType: (type: MarketType) => void;
  setMarketTitle: (title: string) => void;
  setLoading: (loading: boolean) => void;
}

export const SharedDataLoader: React.FC<SharedDataLoaderProps> = ({
  setMarkets,
  setDte,
  setPrincipal,
  setOutcome,
  setGlobalMarketType,
  setMarketTitle,
  setLoading,
}) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;

    setLoading(true);
    const fetchSharedData = async () => {
      try {
        const response = await fetch(`/api/share?id=${encodeURIComponent(id)}`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to load shared data");
        }

        // Recompute the results here. Do not trust results stored with the share.
        const data = shareSchema.parse(result.data);
        setMarkets(data.markets);
        setDte(data.dte);
        setPrincipal(data.principal);
        setGlobalMarketType(data.markets[0].type);
        setMarketTitle(data.markets[0].title);
        setOutcome(findArbitrage(data));

        toast({ title: "Share Loaded", description: "Successfully loaded shared calculation" });
      } catch (error) {
        console.error("Error loading shared data:", error);
        toast({
          title: "Error Loading Share",
          description: "Failed to load shared calculation",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [searchParams, setMarkets, setDte, setPrincipal, setOutcome, setGlobalMarketType, setMarketTitle, setLoading]);

  return null;
};
