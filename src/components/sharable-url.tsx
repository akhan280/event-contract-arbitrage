import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { Market, ArbitrageResponse } from "../lib/types";

interface ShareButtonProps {
  markets: Market[];
  dte: number;
  principal: number;
  outcome: ArbitrageResponse | null;
}

const ShareButton: React.FC<ShareButtonProps> = ({ markets, dte, principal, outcome }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    try {
      setIsLoading(true);
      
      const shareData = {
        markets,
        dte,
        principal,
        outcome,
        createdAt: new Date()
      };
      
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareData),
      });
      
      const { id } = await response.json();
      
      if (!id) throw new Error('Failed to generate share link');
      
      const shareableUrl = `${window.location.origin}?id=${id}`;
      await navigator.clipboard.writeText(shareableUrl);
      
      toast({
        title: "Share link copied!",
        description: "The link has been copied to your clipboard. It will expire in 24 hours.",
        variant: "default",
      });
    } catch (error) {
      console.log("An error occured", error)
      toast({
        title: "Error creating share link",
        description: "Unable to create share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleShare}
      variant="outline" 
      className="gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      Share
    </Button>
  );
};

export default ShareButton;