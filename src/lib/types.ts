

export interface Market {
    id: string;
    title: string;
    broker: string;
    type: 'binary' | 'multi';
    options: Option[];
}

export interface Option {
    id: string;
    name: string;
    prices: MarketPrices
}

export interface MarketPrices {
    buy: {
        yes: number;
        no: number;
    };
    sell: {
        yes: number;
        no: number;
    };
}

export interface ArbitrageResponse {
    results: {
        market: string;
        action: string;
        profitPerContract: string;
        netProfitPerContract: string;
        numberOfContracts: number;
        totalNetProfit: string;
        annualizedROI: string;
        perContractFees: string;
        perTransactionFees: string;
        description: string
    }[];
}


export interface ArbitrageRequest {
    markets: Market[];
    dte: number;
    principal: number
}