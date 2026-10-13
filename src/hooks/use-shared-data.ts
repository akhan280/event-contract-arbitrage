import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CalculationInput } from "../lib/types";
import { shareSchema } from "../lib/schemas";
import { toast } from "../hooks/use-toast";

interface SharedDataLoaderProps {
  onLoad: (input: CalculationInput) => void;
  setLoading: (loading: boolean) => void;
}

export const SharedDataLoader: React.FC<SharedDataLoaderProps> = ({ onLoad, setLoading }) => {
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

        // onLoad recomputes the results. Do not trust results stored with the share.
        onLoad(shareSchema.parse(result.data));

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
  }, [searchParams, onLoad, setLoading]);

  return null;
};
