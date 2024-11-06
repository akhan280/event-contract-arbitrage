"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, DollarSign, Plus, Trash, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArbitrageRequest, ArbitrageResponse, Market } from "../lib/types";
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
import { Label } from "../components/ui/label";
import Header from "../components/header";
import ArbitrageCard from "../components/arbitrage-card";
import { toast } from "../hooks/use-toast";

const initialMarket: Market = {
  id: "1",
  title: "",
  broker: "Polymarket",
  type: "binary",
  options: [
    {
      id: "1",
      name: "Option 1",
      prices: {
        buy: { yes: 0, no: 0 },
        sell: { yes: 0, no: 0 },
      },
    },
  ],
};

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([initialMarket]);
  const [outcome, setOutcome] = useState<ArbitrageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [marketTitle, setMarketTitle] = useState("");
  const [globalMarketType, setGlobalMarketType] = useState<"binary" | "multi">(
    "binary"
  );
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
                    prices: { buy: { yes: 0, no: 0 }, sell: { yes: 0, no: 0 } },
                  },
                ]
              : market.options
            : [
                {
                  id: "1",
                  name: marketTitle,
                  prices: { buy: { yes: 0, no: 0 }, sell: { yes: 0, no: 0 } },
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
    const newMarket = {
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
                prices: { buy: { yes: 0, no: 0 }, sell: { yes: 0, no: 0 } },
              },
            ]
          : markets[0].options.map((option) => ({
              id: Math.random().toString(),
              name: option.name,
              prices: { buy: { yes: 0, no: 0 }, sell: { yes: 0, no: 0 } },
            })),
    };
    setMarkets([...markets, newMarket]);
  };

  const addOption = (marketId: string) => {
    const newOption = {
      id: Math.random().toString(),
      name: `Option ${markets[0].options.length + 1}`,
      prices: { buy: { yes: 0, no: 0 }, sell: { yes: 0, no: 0 } },
    };

    setMarkets(
      markets.map((market) => ({
        ...market,
        options: [...market.options, newOption],
      }))
    );
  };

  const removeOption = (marketId: string, optionIndex: number) => {
    setMarkets(
      markets.map((market) => ({
        ...market,
        options: market.options.filter((_, index) => index !== optionIndex),
      }))
    );
  };

  const getMissingRequirements = (markets: Market[]) => {
    if (!markets.some((m) => m.title)) {
      return "Please enter a market title";
    }
    console.log("Current dte", dte)

    if (dte < 1) {
      return "Days to expiration must be 1 or greater";
    }
    if (principal <= 0) {
      return "Principal amount must be greater than 0";
    }
    if (
      !markets.some((m) =>
        m.options.some(
          (o) =>
            o.prices.buy.yes > 0 ||
            o.prices.buy.no > 0 ||
            o.prices.sell.yes > 0 ||
            o.prices.sell.no > 0
        )
      )
    ) {
      return "Please enter at least one price";
    }
    return "";
  };

  const updateOptionPrice = (
    marketId: string,
    optionId: string,
    type: "buy" | "sell",
    side: "yes" | "no",
    value: string
  ) => {
    const numValue = formatNumberInput(value);
    setMarkets(
      markets.map((market) => {
        if (market.id === marketId) {
          return {
            ...market,
            options: market.options.map((option) => {
              if (option.id === optionId) {
                return {
                  ...option,
                  prices: {
                    ...option.prices,
                    [type]: { ...option.prices[type], [side]: numValue },
                  },
                };
              }
              return option;
            }),
          };
        }
        return market;
      })
    );
  };

  const handleCalculate = async () => {
    const validationErrors = validateInputs();
    console.log("[HandleCalculate]", validationErrors)
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        toast({
          variant: "destructive",
          title: "Missing Requirements",
          description: error,
        });
      });
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const marketData: Market[] = markets.map((market) => ({
        id: market.id,
        title: market.title,
        broker: market.broker,
        type: market.type,
        options: market.options.map((option) => ({
          id: option.id,
          name: market.type === "binary" ? marketTitle : option.name,
          prices: option.prices,
        })),
      }));

      const response = await fetch("/api/calculateArbitrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markets: marketData,
          dte: dte,
          principal: principal,
        } as ArbitrageRequest),
      });

      const data = await response.json();
      setOutcome(data.data as ArbitrageResponse);
      
      if (data.data.results.length === 0) {
        toast({
          title: "No Arbitrage Found",
          description: "No profitable arbitrage opportunities were found with the current prices.",
          variant: "default",
        });
      }
    } catch (err) {
      setError("Failed to calculate arbitrage. Please check your input values.");
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: "Failed to calculate arbitrage. Please check your input values.",
      });
    }
    
    setLoading(false);
  };


  const validateInputs = (): string[] => {
    const errors: string[] = [];
    
    if (!markets.some((m) => m.title)) {
      errors.push("Please enter a market title");
    }
    
    if (dte < 1) {
      errors.push("Days to expiration must be 0 or greater");
    }
    
    if (principal <= 0) {
      errors.push("Principal amount must be greater than 0");
    }
    
    if (!markets.some((m) => 
      m.options.some(
        (o) =>
          o.prices.buy.yes > 0 ||
          o.prices.buy.no > 0 ||
          o.prices.sell.yes > 0 ||
          o.prices.sell.no > 0
      )
    )) {
      errors.push("Please enter at least one price");
    }
    
    return errors;
  };

  return (
    <>
      <div className="flex flex-col sm:grid sm:grid-cols-[40%_60%] min-h-screen sm:h-screen sm:overflow-hidden">
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
          <Card className="mb-8 ">
            <CardHeader>
              {" "}
              <div className="sm:hidden">
                <Header />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col gap-7">
                  <div className="flex flex-row py-4">
                    <Input
                      placeholder="Enter market title"
                      value={marketTitle}
                      onChange={(e) => updateMarketTitle(e.target.value)}
                      className="text-2xl py-8 border-0 focus:ring-0 focus:outline-none shadow-none hover:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
                    />
                    <div className="flex flex-row gap-4">
                      <div className="w-fit">
                        <Label className="text-xs">
                          Contract length &#40;days&#41;
                        </Label>
                        <Input
                          value={dte}
                          onChange={(e) =>
                            setDte(Math.max(0, parseInt(e.target.value) || 0))
                          }
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
                            onChange={(e) =>
                              setPrincipal(
                                Math.max(0, parseFloat(e.target.value) || 0)
                              )
                            }
                            className="text-sm w-32 pl-6 rounded-xl"
                            placeholder="Principal Amount"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {markets.map((market, index) => (
                    <Card
                      key={market.id}
                      className="mb-4 bg-[#F6F6F6]/60 p-6 rounded-xl"
                    >
                      <div className="space-y-4">
                        <BrokerSelect
                          value={
                            market.broker as
                              | "Polymarket"
                              | "Kalshi"
                              | "Robinhood"
                          }
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

                        <Tabs defaultValue="buy">
                          {/* <TabsList>
                      <TabsTrigger value="buy">Buy Prices</TabsTrigger>
                      <TabsTrigger value="sell">Sell Prices</TabsTrigger>
                    </TabsList> */}
                          <TabsContent value="buy">
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
                                        value={option.prices.buy.yes || ""}
                                        onChange={(e) =>
                                          updateOptionPrice(
                                            market.id,
                                            option.id,
                                            "buy",
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
                                        value={option.prices.buy.no || ""}
                                        onChange={(e) =>
                                          updateOptionPrice(
                                            market.id,
                                            option.id,
                                            "buy",
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
                                            removeOption(
                                              market.id,
                                              optionIndex
                                            );
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
                                    onClick={() => addOption(market.id)}
                                    variant="outline"
                                    className=""
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Option
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="sell">
                            <div className="space-y-4">
                              {market.options.map((option) => (
                                <div key={option.id} className="space-y-2">
                                  <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                      <Input
                                        value={option.name}
                                        disabled
                                        className="mb-2"
                                      />
                                    </div>
                                    <div className="relative flex-1">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={option.prices.sell.yes || ""}
                                        onChange={(e) =>
                                          updateOptionPrice(
                                            market.id,
                                            option.id,
                                            "sell",
                                            "yes",
                                            e.target.value
                                          )
                                        }
                                        className="pr-6"
                                        placeholder="Yes Price"
                                      />
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                        ¢
                                      </span>
                                    </div>
                                    <div className="relative flex-1">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={option.prices.sell.no || ""}
                                        onChange={(e) =>
                                          updateOptionPrice(
                                            market.id,
                                            option.id,
                                            "sell",
                                            "no",
                                            e.target.value
                                          )
                                        }
                                        className="pr-6"
                                        placeholder="No Price"
                                      />
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                        ¢
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
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
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? "Calculating..." : "Calculate Arbitrage"}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {(loading || !markets.some((m) => m.title && m.options.some((o) =>
                                o.prices.buy.yes > 0 ||
                                o.prices.buy.no > 0 ||
                                o.prices.sell.yes > 0 ||
                                o.prices.sell.no > 0
                            )
                        )) && (
                        <TooltipContent>
                          <p>
                            {loading
                              ? "Calculating..."
                              : getMissingRequirements(markets)}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                </div>
                {outcome && (
                  <div className="space-y-6">
                    <div className="text-lg font-medium">Arbitrage Opportunities</div>
                    
                    <Alert variant="default" className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <AlertDescription className="text-amber-800">
                        This opportunity is shown for informational purposes only. Market data may be delayed or inaccurate. Always perform your own due diligence.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-4">
                      {outcome.results.length > 0 ? (
                        outcome.results.map((result, index) => (
                          <ArbitrageCard key={index} result={result} />
                        ))
                      ) : null}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
