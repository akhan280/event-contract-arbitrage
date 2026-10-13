import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BrokerSelect from "@/components/broker-select";
import { Broker, Market } from "@/lib/types";
import type { LiveQuote } from "@/lib/quotes";
import { LinkImport } from "./link-import";

const yesColors: Record<Broker, { text: string; badge: string }> = {
  Kalshi: { text: "text-[#22C55E]", badge: "bg-[#22C55E] text-white" },
  Polymarket: { text: "text-[#255CFF]", badge: "bg-[#255CFF] text-white" },
  Robinhood: { text: "text-black", badge: "bg-[#CCFF00] text-black" },
};

interface MarketCardProps {
  market: Market;
  /** The first card owns the option names. Other cards follow it. */
  isFirst: boolean;
  onBrokerChange: (broker: Broker) => void;
  onRemove: () => void;
  onPriceChange: (optionIndex: number, side: "yes" | "no", value: string) => void;
  onRenameOption: (optionIndex: number, name: string) => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onQuote: (quote: LiveQuote) => void;
}

export function MarketCard({
  market,
  isFirst,
  onBrokerChange,
  onRemove,
  onPriceChange,
  onRenameOption,
  onAddOption,
  onRemoveOption,
  onQuote,
}: MarketCardProps) {
  const isMulti = market.type === "multi";

  return (
    <Card className="bg-[#F6F6F6]/60 p-4 sm:p-6 rounded-xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <BrokerSelect value={market.broker} onChange={onBrokerChange} />
        {!isFirst && (
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${market.broker} market`}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      {market.broker !== "Robinhood" && <LinkImport onQuote={onQuote} />}

      <div className="space-y-3">
        {market.options.map((option, index) => (
          <div key={option.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            {isMulti && (
              <Input
                value={option.name}
                onChange={(e) => onRenameOption(index, e.target.value)}
                disabled={!isFirst}
                className="sm:flex-1 h-12 text-base text-black"
                placeholder="Option name"
                aria-label="Option name"
              />
            )}
            <div className="flex flex-1 gap-2 sm:gap-4">
              <PriceInput
                value={option.prices.yes}
                onChange={(v) => onPriceChange(index, "yes", v)}
                placeholder="Yes price"
                textClass={yesColors[market.broker].text}
                badgeClass={yesColors[market.broker].badge}
              />
              <PriceInput
                value={option.prices.no}
                onChange={(v) => onPriceChange(index, "no", v)}
                placeholder="No price"
                textClass="text-[#AA00FF]"
                badgeClass="bg-[#AA00FF] text-white"
              />
              {isMulti && isFirst && market.options.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="self-center"
                  onClick={() => onRemoveOption(index)}
                  aria-label={`Remove ${option.name || "option"}`}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isMulti && isFirst && (
        <div className="flex justify-center pt-2">
          <Button onClick={onAddOption} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
      )}
    </Card>
  );
}

function PriceInput({
  value,
  onChange,
  placeholder,
  textClass,
  badgeClass,
}: {
  value: number;
  onChange: (value: string) => void;
  placeholder: string;
  textClass: string;
  badgeClass: string;
}) {
  return (
    <div className="relative flex-1">
      <Input
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        max="100"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`pr-10 h-12 text-base rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${textClass}`}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <span className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-sm ${badgeClass}`}>¢</span>
    </div>
  );
}
