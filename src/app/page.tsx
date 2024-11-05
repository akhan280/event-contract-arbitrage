"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle, DollarSign, Plus, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ArbitrageRequest, ArbitrageResponse, Market } from '../lib/types';
import Image from "next/image"
import BrokerSelect from '@/components/broker-select';

const initialMarket: Market = {
  id: '1',
  title: '',
  broker: 'Polymarket',
  type: 'binary',
  options: [{
    id: '1',
    name: 'Option 1',
    prices: {
      buy: { yes: 0, no: 0 },
      sell: { yes: 0, no: 0 }
    }
  }]
};

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([initialMarket]);
  const [outcome, setOutcome] = useState<ArbitrageResponse| null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [marketTitle, setMarketTitle] = useState('');

  const formatNumberInput = (value: string): number => {
    const cleanedValue = value.replace(/[^\d.]/g, '');
    const parts = cleanedValue.split('.');
    const formattedValue = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
    const numValue = Math.min(Math.max(parseFloat(formattedValue) || 0, 0), 100);
    return Number(numValue.toFixed(2));
  };

  const updateMarketTitle = (value: string) => {
    setMarketTitle(value);
    setMarkets(markets.map(market => ({
      ...market,
      title: value
    })));
  };

  const addMarket = () => {
    setMarkets([...markets, {
      id: Math.random().toString(),
      title: '',
      broker: 'Polymarket',
      type: 'binary',
      options: [{
        id: Math.random().toString(),
        name: 'Option 1',
        prices: {
          buy: { yes: 0, no: 0 },
          sell: { yes: 0, no: 0 }
        }
      }]
    }]);
  };

  const addOption = (marketId: string) => {
    setMarkets(markets.map(market => {
      if (market.id === marketId) {
        return {
          ...market,
          type: 'multi',
          options: [...market.options, {
            id: Math.random().toString(),
            name: `Option ${market.options.length + 1}`,
            prices: {
              buy: { yes: 0, no: 0 },
              sell: { yes: 0, no: 0 }
            }
          }]
        };
      }
      return market;
    }));
  };

  const removeOption = (marketId: string, optionId: string) => {
    setMarkets(markets.map(market => {
      if (market.id === marketId && market.options.length > 1) {
        return {
          ...market,
          options: market.options.filter(opt => opt.id !== optionId)
        };
      }
      return market;
    }));
  };

  const updateMarketType = (marketId: string, type: 'binary' | 'multi') => {
    setMarkets(markets.map(market => {
      if (market.id === marketId) {
        if (type === 'binary') {
          return {
            ...market,
            type,
            options: [{
              id: '1',
              name: `${marketTitle}`,
              prices: {
                buy: { yes: 0, no: 0 },
                sell: { yes: 0, no: 0 }
              }
            }]
          };
        }
        return { ...market, type };
      }
      return market;
    }));
  };

  const updateOptionPrice = (
    marketId: string,
    optionId: string,
    type: 'buy' | 'sell',
    side: 'yes' | 'no',
    value: string
  ) => {
    const numValue = formatNumberInput(value);
    
    setMarkets(markets.map(market => {
      if (market.id === marketId) {
        return {
          ...market,
          options: market.options.map(option => {
            if (option.id === optionId) {
              return {
                ...option,
                prices: {
                  ...option.prices,
                  [type]: {
                    ...option.prices[type],
                    [side]: numValue
                  }
                }
              };
            }
            return option;
          })
        };
      }
      return market;
    }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    try {
      const marketData: Market[] = markets.map(market => ({
        id: market.id,
        title: market.title,
        broker: market.broker,
        type: market.type,
        options: market.options.map(option => ({
          id: option.id,
          name: market.type === 'binary' ? marketTitle : option.name,
          prices: option.prices
        }))
      }));

      console.log('market data', marketData)

      const response = await fetch('/api/calculateArbitrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markets: marketData } as ArbitrageRequest)
      });
      
      const data = await response.json();
      console.log("[Returned Data]", data)
      setOutcome(data.data as ArbitrageResponse);
      console.log("[SetResults]", data.results)

    } catch (err) {
      setError('Failed to calculate arbitrage. Please check your input values.');
    }
    setLoading(false);
  };

  return (
    <div className="sm:grid grid-cols-[50%_50%] h-screen">
      <Card className="mb-8 border-r-[0.5px] border-black/40">
        <CardHeader>
        <Input 
          placeholder="Enter market title"
          value={marketTitle} 
          onChange={(e) => updateMarketTitle(e.target.value)} 
          className="text-2xl border-[0.5px] py-8 focus:ring-0 focus:outline-none shadow-none"
        />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col">
              {markets.map((market, index) => (
                <Card key={market.id} className="mb-4 bg-[#F6F6F6]/60 p-6 rounded-xl">
                  <div className="space-y-4">
                        <BrokerSelect 
                          value={market.broker as 'Polymarket' | 'Kalshi'}
                          onChange={(value) => setMarkets(markets.map(m =>
                            m.id === market.id ? { ...m, broker: value } : m
                          ))}
                        />

                      <div className='flex flex-row justify-between items-center gap-2 w-full'>
                        <Tabs defaultValue={market.type} onValueChange={(value: string) => 
                          updateMarketType(market.id, value as 'binary' | 'multi')
                        }>
                          <TabsList className='outline-none'>
                            <TabsTrigger value="binary">Binary Market</TabsTrigger>
                            <TabsTrigger value="multi">Multiple Choice</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        <div className="flex justify-between items-center">
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setMarkets(markets.filter(m => m.id !== market.id))}
                              className='outline outline-black outline-[0.5px] text-black'
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
                          {market.options.map(option => (
                            <div key={option.id} className="space-y-2">
                              <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Input
                                      value={market.type === 'binary' ? marketTitle: option.name}
                                      onChange={(e) => setMarkets(markets.map(m => 
                                        m.id === market.id ? {
                                          ...m,
                                          options: m.options.map(o =>
                                            o.id === option.id ? { ...o, name: e.target.value } : o
                                          )
                                        } : m
                                      ))}
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
                                    value={option.prices.buy.yes || ''}
                                    onChange={(e) => updateOptionPrice(
                                      market.id,
                                      option.id,
                                      'buy',
                                      'yes',
                                      e.target.value
                                    )}
                                    className={`pr-6 h-14 text-lg rounded-xl ${
                                      market.broker === 'Kalshi' 
                                        ? 'text-[#22C55E]' // Kalshi green
                                        : 'text-[#255CFF]' // Polymarket blue
                                    }`}
                                    placeholder="Yes Price"
                                  />
                                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-white ${
                                      market.broker === 'Kalshi'
                                        ? 'bg-[#22C55E]'  // Kalshi green background
                                        : 'bg-[#255CFF]'  // Polymarket blue background
                                    }`}>¢</span>                                
                                </div>
                                <div className="relative flex-1">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={option.prices.buy.no || ''}
                                    onChange={(e) => updateOptionPrice(
                                      market.id,
                                      option.id,
                                      'buy',
                                      'no',
                                      e.target.value
                                    )}
                                    className="pr-6 h-14 text-lg text-[#AA00FF] rounded-xl"
                                    placeholder="No Price"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#AA00FF] p-2 rounded-md text-white">¢</span>
                                </div>
                                {market.type === 'multi' && market.options.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOption(market.id, option.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                          {market.type === 'multi' && (
                            <div className='flex items-center justify-center pt-8'>
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
                          {market.options.map(option => (
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
                                    value={option.prices.sell.yes || ''}
                                    onChange={(e) => updateOptionPrice(
                                      market.id,
                                      option.id,
                                      'sell',
                                      'yes',
                                      e.target.value
                                    )}
                                    className="pr-6"
                                    placeholder="Yes Price"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2">¢</span>
                                </div>
                                <div className="relative flex-1">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={option.prices.sell.no || ''}
                                    onChange={(e) => updateOptionPrice(
                                      market.id,
                                      option.id,
                                      'sell',
                                      'no',
                                      e.target.value
                                    )}
                                    className="pr-6"
                                    placeholder="No Price"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2">¢</span>
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

            <div className='flex flex-row gap-2'>
              <Button onClick={addMarket} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Market
              </Button>

              <Button
                onClick={handleCalculate}
                disabled={loading || !markets.some(m => m.title && m.options.some(o => 
                  (o.prices.buy.yes > 0 || o.prices.buy.no > 0) || (o.prices.sell.yes > 0 || o.prices.sell.no > 0)
                ))}
                className="w-full"
              >
                {loading ? 'Calculating...' : 'Calculate Arbitrage'}
              </Button>
            </div>
        

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-xl w-fit pt-8 p-2 rounded-2xl">Arbitrage Opportunities:</div>
            {outcome && (
              <div className="grid grid-cols-2 gap-2">
                {outcome.results.length > 0 ? (
                  outcome.results.map((localResult, index) => (
                    <Card key={index} className="p-4 bg-[#F6F6F6]/60 gap-2 rounded-2xl">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{localResult.market}</h3>
                        <p>{localResult.action}</p>
                        <p className="text-green-600">Potential profit: ${localResult.netProfit}</p>
                        <p className="text-green-600">Fees: ${localResult.totalFees}</p>
                        <p className="text-green-600">Profit per contract: ${localResult.profitPerContract}</p>
                        <p className="text-green-600">Description: ${localResult.description}</p>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No arbitrage opportunities found. Try different market prices.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}