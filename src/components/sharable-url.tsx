import React from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { ArbitrageResponse, Market } from "../lib/types";

const ShareButton = ({ markets, dte, principal, outcome }: {markets: Market[], dte: number, principal: number,   outcome: ArbitrageResponse | null;}) => {
  const handleShare = () => {
    try {

      const shareableData = {
        markets,
        dte,
        principal,
        outcome,
      };

      const encodedData = btoa(JSON.stringify(shareableData));
      const shareableUrl = `${window.location.origin}?share=${encodedData}`;

      navigator.clipboard.writeText(shareableUrl);

      toast({
        title: "Share link copied!",
        description: "The link has been copied to your clipboard.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error creating share link",
        description: "Unable to create share link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleShare} variant="outline" className="gap-2">
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
};

export default ShareButton;
