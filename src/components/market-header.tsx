import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface MarketHeaderProps {
  marketTitle: string;
  updateMarketTitle: (title: string) => void;
  dte: number;
  setDte: (dte: number) => void;
  principal: number;
  setPrincipal: (principal: number) => void;
}

export function MarketHeader({
  marketTitle,
  updateMarketTitle,
  dte,
  setDte,
  principal,
  setPrincipal,
}: MarketHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start justify-between pb-6 border-b border-gray-100">
      {/* Market Title Input */}
      <div className="w-full sm:w-1/2 mb-6 sm:mb-0">
        <Input
          placeholder="Enter market title"
          value={marketTitle}
          onChange={(e) => updateMarketTitle(e.target.value)}
          className="text-xl font-medium px-0 h-12 bg-transparent border-0 ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 w-full"
        />
      </div>

      {/* Metrics Section */}
      <div className="flex items-end gap-4 w-full sm:w-auto">
        {/* DTE Input */}
        <div className="w-full sm:w-32">
          <Label className="text-xs font-medium text-gray-500 mb-2 block">
            Contract length (days)
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={dte}
              onChange={(e) =>
                setDte(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="h-9 bg-gray-50 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-gray-950 transition-shadow"
              placeholder="0"
            />
          </div>
        </div>

        {/* Principal Input */}
        <div className="w-full sm:w-32">
          <Label className="text-xs font-medium text-gray-500 mb-2 block">
            Principal amount
          </Label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              $
            </span>
            <Input
              type="number"
              min="0"
              value={principal}
              onChange={(e) =>
                setPrincipal(Math.max(0, parseFloat(e.target.value) || 0))
              }
              className="pl-6 h-9 bg-gray-50 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-gray-950 transition-shadow"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
