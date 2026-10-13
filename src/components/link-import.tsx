import { useState } from "react";
import { Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import type { LiveQuote } from "@/lib/quotes";

/** Paste a Kalshi or Polymarket link to fill a card with live ask prices. */
export function LinkImport({ onQuote }: { onQuote: (quote: LiveQuote) => void }) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!link.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/quote?url=${encodeURIComponent(link.trim())}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not load prices.");
      onQuote(body.quote as LiveQuote);
      setLink("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not load prices",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={load} className="flex gap-2">
      <div className="relative flex-1">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste a Kalshi or Polymarket link for live prices"
          aria-label="Kalshi or Polymarket link"
          className="pl-9 bg-white"
        />
      </div>
      <Button type="submit" variant="outline" disabled={loading || !link.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get prices"}
      </Button>
    </form>
  );
}
