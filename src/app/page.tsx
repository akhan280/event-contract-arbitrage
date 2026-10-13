"use client";
import React, { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Trash, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Market, Opportunity } from "../lib/types";
import { findArbitrage } from "../lib/arbitrage";
import BrokerSelect from "@/components/broker-select";
import Credit from "@/components/credit";
import { AdditionalInformation } from "@/components/additional-info";
import EmailSubscription from "@/components/email-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import Header from "../components/header";
import ArbitrageCard from "../components/arbitrage-card";
import { toast } from "../hooks/use-toast";
import ShareButton from "../components/sharable-url";
import { SharedDataLoader } from "../hooks/use-shared-data";
import Loading from "./loading";
import { MarketInputs } from "../components/market-header";

const initialMarket: Market = {
  id: "1",
  title: "",
  broker: "Polymarket",
  type: "binary",
  options: [
    {
      id: "1",
      name: "Option 1",
      prices: { yes: 0, no: 0 },
    },
  ],
};

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([initialMarket]);
  const [outcome, setOutcome] = useState<Opportunity[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [marketTitle, setMarketTitle] = useState("");
  const [globalMarketType, setGlobalMarketType] = useState<"binary" | "multi">("binary");
  const [dte, setDte] = useState<number>(0);
  const [principal, setPrincipal] = useState<number>(0);

  const updateAllMarketTypes = (type: "binary" | "multi") => {
    setGlobalMarketType(type);
    setMarkets(
      markets.map((market) => ({
        ...market,
        type,
        options:
          type === "multi"
            ? market.options.length < 2
              ? [
                  ...market.options,
                  {
                    id: Math.random().toString(),
                    name: "Option 2",
                    prices: { yes: 0, no: 0 },
                  },
                ]
              : market.options
            : [
                {
                  id: "1",
                  name: marketTitle,
                  prices: { yes: 0, no: 0 },
                },
              ],
      }))
    );
  };

  const formatNumberInput = (value: string): number => {
    const cleanedValue = value.replace(/[^\d.]/g, "");
    const parts = cleanedValue.split(".");
    const formattedValue =
      parts[0] + (parts.length > 1 ? "." + parts[1].slice(0, 2) : "");
    const numValue = Math.min(
      Math.max(parseFloat(formattedValue) || 0, 0),
      100
    );
    return Number(numValue.toFixed(2));
  };

  const updateMarketTitle = (value: string) => {
    setMarketTitle(value);
    setMarkets(
      markets.map((market) => ({
        ...market,
        title: value,
      }))
    );
  };

  const updateOptionNameAcrossMarkets = (optionIndex: number, newName: string) => {
    setMarkets(
      markets.map((market) => ({
        ...market,
        options: market.options.map((option, index) =>
          index === optionIndex ? { ...option, name: newName } : option
        ),
      }))
    );
  };

  const addMarket = () => {
    const newMarket: Market = {
      id: Math.random().toString(),
      title: marketTitle,
      broker: "Kalshi",
      type: globalMarketType,
      options:
        globalMarketType === "binary"
          ? [
              {
                id: Math.random().toString(),
                name: marketTitle,
                prices: { yes: 0, no: 0 },
              },
            ]
          : markets[0].options.map((option) => ({
              id: Math.random().toString(),
              name: option.name,
              prices: { yes: 0, no: 0 },
            })),
    };
    setMarkets([...markets, newMarket]);
  };

  const addOption = () => {
    const newOption = {
      id: Math.random().toString(),
      name: `Option ${markets[0].options.length + 1}`,
      prices: { yes: 0, no: 0 },
    };

    setMarkets(
      markets.map((market) => ({
        ...market,
        options: [...market.options, newOption],
      }))
    );
  };

  const removeOption = (optionIndex: number) => {
    setMarkets(
      markets.map((market) => ({
        ...market,
        options: market.options.filter((_, index) => index !== optionIndex),
      }))
    );
  };

  const hasAnyPrice = markets.some((m) =>
    m.options.some((o) => o.prices.yes > 0 || o.prices.no > 0)
  );

  const getMissingRequirement = (): string => {
    if (!marketTitle.trim()) return "Please enter a market title";
    if (dte < 1) return "Days to expiration must be 1 or greater";
    if (principal <= 0) return "Principal amount must be greater than 0";
    if (!hasAnyPrice) return "Please enter at least one price";
    if (
      globalMarketType === "multi" &&
      new Set(markets[0].options.map((o) => o.name.trim().toLowerCase())).size !==
        markets[0].options.length
    ) {
      return "Each option needs a different name";
    }
    return "";
  };

  const updateOptionPrice = (
    marketId: string,
    optionId: string,
    side: "yes" | "no",
    value: string
  ) => {
    const numValue = formatNumberInput(value);
    setMarkets(
      markets.map((market) =>
        market.id !== marketId
          ? market
          : {
              ...market,
              options: market.options.map((option) =>
                option.id !== optionId
                  ? option
                  : { ...option, prices: { ...option.prices, [side]: numValue } }
              ),
            }
      )
    );
  };

  const handleCalculate = () => {
    const missing = getMissingRequirement();
    if (missing) {
      toast({ variant: "destructive", title: "Missing Requirements", description: missing });
      return;
    }

    setError("");
    try {
      const results = findArbitrage({ markets, dte, principal });
      setOutcome(results);
      if (results.length === 0) {
        toast({
          title: "No Arbitrage Found",
          description: "No profitable trades after fees at these prices.",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to calculate arbitrage. Please check your input values.");
    }
  };

  return (
    <>
      {/* useSearchParams needs its own boundary, or the whole page renders only on the client. */}
      <Suspense fallback={null}>
        <SharedDataLoader
        setMarkets={setMarkets}
        setDte={setDte}
        setPrincipal={setPrincipal}
        setOutcome={setOutcome}
        setGlobalMarketType={setGlobalMarketType}
        setMarketTitle={setMarketTitle}
        setLoading={setLoading}
        />
      </Suspense>
      {loading ? <Loading /> : (

      <div className="flex flex-col sm:grid sm:grid-cols-[30%_70%] min-h-screen sm:h-screen sm:overflow-hidden">
        <div className="order-2 sm:order-1 min-h-screen sm:h-screen flex flex-col">
          <div className="hidden sm:block">
            <Header />
          </div>
          <div className="flex-1 flex flex-col justify-evenly items-center">
            <AdditionalInformation />
            <div className="p-4">
              <EmailSubscription />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-full mb-6">
            <Credit />
          </div>
        </div>
      
      
      <div className="order-1 sm:order-2 overflow-y-auto border-t sm:border-t-0 sm:border-l border-black/20">
        <Card className="mb-8">
            <div className="sm:hidden">
              <Header />
            </div>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col gap-7">
                
                <MarketInputs 
                  marketTitle={marketTitle}
                  dte={dte}
                  principal={principal}
                  updateMarketTitle={updateMarketTitle}
                  setDte={setDte}
                  setPrincipal={setPrincipal}
                />
                
                {markets.map((market, index) => (
                  <Card
                    key={market.id}
                    className="mb-4 bg-[#F6F6F6]/60 p-6 rounded-xl"
                  >
                    <div className="space-y-4">
                      <BrokerSelect
                        value={market.broker}
                        onChange={(value) =>
                          setMarkets(
                            markets.map((m) =>
                              m.id === market.id ? { ...m, broker: value } : m
                            )
                          )
                        }
                      />

                      <div className="flex flex-row justify-between items-center gap-2 w-full">
                        <Tabs
                          value={globalMarketType}
                          onValueChange={(value: string) =>
                            updateAllMarketTypes(value as "binary" | "multi")
                          }
                        >
                          <TabsList className="outline-none">
                            <TabsTrigger value="binary">
                              Binary Market
                            </TabsTrigger>
                            <TabsTrigger value="multi">
                              Multiple Choice
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                        <div className="flex justify-between items-center">
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setMarkets(
                                  markets.filter((m) => m.id !== market.id)
                                )
                              }
                              className="outline outline-black outline-[0.5px] text-black"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                          <div className="space-y-4">
                            {market.options.map((option) => (
                              <div key={option.id} className="space-y-2">
                                <div className="flex items-center gap-4">
                                  <div className="relative flex-1">
                                    <Input
                                      value={
                                        market.type === "binary"
                                          ? marketTitle
                                          : option.name
                                      }
                                      onChange={(e) => {
                                        if (market.type === "multi") {
                                          const optionIndex =
                                            market.options.findIndex(
                                              (o) => o.id === option.id
                                            );
                                          updateOptionNameAcrossMarkets(
                                            optionIndex,
                                            e.target.value
                                          );
                                        }
                                      }}
                                      className="pr-6 h-14 text-lg text-black"
                                      placeholder="Option name"
                                    />
                                  </div>
                                  <div className="relative flex-1">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      value={option.prices.yes || ""}
                                      onChange={(e) =>
                                        updateOptionPrice(
                                          market.id,
                                          option.id,
                                          "yes",
                                          e.target.value
                                        )
                                      }
                                      className={`pr-6 h-14 text-lg rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                        market.broker === "Kalshi"
                                          ? "text-[#22C55E]"
                                          : market.broker === "Polymarket"
                                          ? "text-[#255CFF]"
                                          : "text-black"
                                      }`}
                                      placeholder="Yes Price"
                                    />
                                    <span
                                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md ${
                                        market.broker === "Kalshi"
                                          ? "bg-[#22C55E] text-white" // Kalshi green background
                                          : market.broker === "Polymarket"
                                          ? "bg-[#255CFF] text-white" // Polymarket blue background
                                          : "bg-[#CCFF00] text-black" // Robinhood color background
                                      }`}
                                    >
                                      ¢
                                    </span>
                                  </div>
                                  <div className="relative flex-1">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      value={option.prices.no || ""}
                                      onChange={(e) =>
                                        updateOptionPrice(
                                          market.id,
                                          option.id,
                                          "no",
                                          e.target.value
                                        )
                                      }
                                      className="pr-6 h-14 text-lg text-[#AA00FF] rounded-xl"
                                      placeholder="No Price"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#AA00FF] p-2 rounded-md text-white">
                                      ¢
                                    </span>
                                  </div>
                                  
                                  {market.type === "multi" &&
                                    market.options.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const optionIndex =
                                            market.options.findIndex(
                                              (o) => o.id === option.id
                                            );
                                          removeOption(optionIndex);
                                        }}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    )}
                                </div>
                              </div>
                            ))}

                            {market.type === "multi" && index === 0 && (
                              <div className="flex items-center justify-center pt-8">
                                <Button
                                  onClick={addOption}
                                  variant="outline"
                                  className=""
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                            )}
                          </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex flex-row gap-2">
                <Button
                  onClick={addMarket}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Market
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full">
                        <Button
                          onClick={handleCalculate}
                          className="w-full"
                        >
                          Calculate Arbitrage
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {getMissingRequirement() && (
                      <TooltipContent>
                        <p>{getMissingRequirement()}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>

              <ShareButton 
                  markets={markets}
                  dte={dte}
                  principal={principal}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              </div>
              {outcome && outcome.length > 0 && (
                <div className="space-y-6">
                  <div className="text-lg font-medium">Arbitrage Opportunities</div>
                  
                  <Alert variant="default" className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-800">
                      This opportunity is shown for informational purposes only. Market data may be delayed or inaccurate. Always perform your own due diligence.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {outcome.map((opportunity) => (
                      <ArbitrageCard key={opportunity.id} opportunity={opportunity} dte={dte} />
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
      )}

    </>
  );
}
