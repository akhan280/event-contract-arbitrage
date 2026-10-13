import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketType } from "@/lib/types";

interface MarketInputsProps {
  marketTitle: string;
  marketType: MarketType;
  dte: number;
  principal: number;
  onTitleChange: (value: string) => void;
  onTypeChange: (value: MarketType) => void;
  onDteChange: (value: number) => void;
  onPrincipalChange: (value: number) => void;
}

export const MarketInputs = ({
  marketTitle,
  marketType,
  dte,
  principal,
  onTitleChange,
  onTypeChange,
  onDteChange,
  onPrincipalChange,
}: MarketInputsProps) => (
  <div className="flex flex-col gap-4 py-4">
    <Input
      placeholder="Enter market title, e.g. Fed cuts rates in December"
      value={marketTitle}
      onChange={(e) => onTitleChange(e.target.value)}
      aria-label="Market title"
      className="text-xl sm:text-2xl py-6 sm:py-8 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
    />
    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
      <Tabs value={marketType} onValueChange={(v) => onTypeChange(v as MarketType)}>
        <TabsList>
          <TabsTrigger value="binary">Binary Market</TabsTrigger>
          <TabsTrigger value="multi">Multiple Choice</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex gap-4 sm:ml-auto">
        <div>
          <Label htmlFor="dte" className="text-xs">
            Days to expiration
          </Label>
          <Input
            id="dte"
            inputMode="numeric"
            value={dte || ""}
            onChange={(e) => onDteChange(Math.max(0, parseInt(e.target.value) || 0))}
            className="text-sm w-32 rounded-xl"
            placeholder="30"
          />
        </div>
        <div>
          <Label htmlFor="principal" className="text-xs">
            Principal
          </Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="principal"
              inputMode="decimal"
              value={principal || ""}
              onChange={(e) => onPrincipalChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="text-sm w-32 pl-6 rounded-xl"
              placeholder="1000"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
