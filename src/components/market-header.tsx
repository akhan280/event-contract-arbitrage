import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MarketInputsProps {
  marketTitle: string;
  dte: number;
  principal: number;
  updateMarketTitle: (value: string) => void;
  setDte: (value: number) => void;
  setPrincipal: (value: number) => void;
}

export const MarketInputs = ({
  marketTitle,
  dte,
  principal,
  updateMarketTitle,
  setDte,
  setPrincipal,
}: MarketInputsProps) => {
  return (
    <div className="flex flex-row py-4">
      <Input
        placeholder="Enter market title"
        value={marketTitle}
        onChange={(e) => updateMarketTitle(e.target.value)}
        className="text-2xl py-8 border-0 focus:ring-0 focus:outline-none shadow-none hover:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
      />
      <div className="flex flex-row gap-4">
        <div className="w-fit">
          <Label className="text-xs">Contract length &#40;days&#41;</Label>
          <Input
            value={dte}
            onChange={(e) => setDte(Math.max(0, parseInt(e.target.value) || 0))}
            className="text-sm w-32 rounded-xl"
            placeholder="Days to Expiration"
          />
        </div>
        <div className="w-fit">
          <Label className="text-xs">Principal Amount</Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <Input
              min="0"
              value={principal}
              onChange={(e) => setPrincipal(Math.max(0, parseFloat(e.target.value) || 0))}
              className="text-sm w-32 pl-6 rounded-xl"
              placeholder="Principal Amount"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
