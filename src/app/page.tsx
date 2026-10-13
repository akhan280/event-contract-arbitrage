"use client";
import { Suspense, useState } from "react";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AdditionalInformation } from "@/components/additional-info";
import ArbitrageCard from "@/components/arbitrage-card";
import Credit from "@/components/credit";
import EmailSubscription from "@/components/email-input";
import Header from "@/components/header";
import { MarketCard } from "@/components/market-card";
import { MarketInputs } from "@/components/market-header";
import ShareButton from "@/components/sharable-url";
import { useCalculator } from "@/hooks/use-calculator";
import { SharedDataLoader } from "@/hooks/use-shared-data";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const calc = useCalculator();
  const [loadingShare, setLoadingShare] = useState(false);
  const missing = calc.missingRequirement();

  const handleCalculate = () => {
    if (missing) {
      toast({ variant: "destructive", title: "Missing information", description: missing });
      return;
    }
    if (calc.calculate().length === 0) {
      toast({ title: "No arbitrage found", description: "No trade makes a profit after fees at these prices." });
    }
  };

  return (
    <>
      {/* useSearchParams needs its own boundary, or the whole page renders only on the client. */}
      <Suspense fallback={null}>
        <SharedDataLoader onLoad={calc.load} setLoading={setLoadingShare} />
      </Suspense>

      <div className="flex flex-col sm:grid sm:grid-cols-[30%_70%] min-h-screen sm:h-screen sm:overflow-hidden">
        <aside className="order-2 sm:order-1 sm:h-screen sm:overflow-y-auto flex flex-col">
          <div className="hidden sm:block">
            <Header />
          </div>
          <div className="flex-1 flex flex-col justify-evenly items-center">
            <AdditionalInformation />
            <div className="p-4">
              <EmailSubscription />
            </div>
          </div>
          <div className="flex justify-center w-full mb-6">
            <Credit />
          </div>
        </aside>

        <main className="order-1 sm:order-2 sm:overflow-y-auto border-t sm:border-t-0 sm:border-l border-black/20">
          <Card className="mb-8 border-0 shadow-none">
            <div className="sm:hidden">
              <Header />
            </div>
            <CardContent className="space-y-6">
              {loadingShare && (
                <p className="flex items-center gap-2 pt-4 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading shared calculation…
                </p>
              )}

              <MarketInputs
                marketTitle={calc.marketTitle}
                marketType={calc.marketType}
                dte={calc.dte}
                principal={calc.principal}
                onTitleChange={calc.setMarketTitle}
                onTypeChange={calc.setMarketType}
                onDteChange={calc.setDte}
                onPrincipalChange={calc.setPrincipal}
              />

              <div className="space-y-4">
                {calc.markets.map((market, index) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    isFirst={index === 0}
                    onBrokerChange={(broker) => calc.setBroker(market.id, broker)}
                    onRemove={() => calc.removeMarket(market.id)}
                    onPriceChange={(i, side, value) => calc.setPrice(market.id, i, side, value)}
                    onRenameOption={calc.renameOption}
                    onAddOption={calc.addOption}
                    onRemoveOption={calc.removeOption}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={calc.addMarket} variant="outline" className="w-full sm:flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Market
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleCalculate} className="w-full sm:flex-1">
                        Calculate Arbitrage
                      </Button>
                    </TooltipTrigger>
                    {missing && (
                      <TooltipContent>
                        <p>{missing}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <ShareButton markets={calc.markets} dte={calc.dte} principal={calc.principal} />
              </div>

              {calc.results && calc.results.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-lg font-medium">Arbitrage Opportunities ({calc.results.length})</h2>
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-800">
                      Check that each venue settles this market on the same source, date, and rules.
                      If two venues settle the same event differently, both legs can lose. Prices
                      move, so confirm them before you trade. This is not financial advice.
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {calc.results.map((opportunity) => (
                      <ArbitrageCard key={opportunity.id} opportunity={opportunity} dte={calc.dte} />
                    ))}
                  </div>
                </section>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
