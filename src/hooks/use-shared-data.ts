import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Market, ArbitrageResponse } from '../lib/types';
import { toast } from "../hooks/use-toast";

interface SharedDataLoaderProps {
  setMarkets: (markets: Market[]) => void;
  setDte: (dte: number) => void;
  setPrincipal: (principal: number) => void;
  setOutcome: (outcome: ArbitrageResponse | null) => void;
  setMarketTitle: (title: string) => void;
}

export const SharedDataLoader: React.FC<SharedDataLoaderProps> = ({
  setMarkets,
  setDte,
  setPrincipal,
  setOutcome,
  setMarketTitle,
}) => {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const id = searchParams.get('id');
    
    if (id) {
      const fetchSharedData = async () => {
        try {
          const response = await fetch(`/api/share?id=${id}`);
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to load shared data');
          }
          
          const { data } = result;
          
          setMarkets(data.markets);
          setDte(data.dte);
          setPrincipal(data.principal);
          setOutcome(data.outcome);
          
          if (data.markets?.[0]?.title) {
            setMarketTitle(data.markets[0].title);
          }
          
          toast({
            title: "Share Loaded",
            description: "Successfully loaded shared calculation",
            variant: "default",
          });
        } catch (error) {
          console.error('Error loading shared data:', error);
          toast({
            title: "Error Loading Share",
            description: "Failed to load shared calculation",
            variant: "destructive",
          });
        }
      };
      
      fetchSharedData();
    }
  }, [searchParams, setMarkets, setDte, setPrincipal, setOutcome, setMarketTitle]);

  return null;
};