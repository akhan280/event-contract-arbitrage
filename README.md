# Event Contract Arbitrage Calculator 📈

A web application for calculating leveraging price discrepancies in prediction markets like Polymarket, Kalshi, and Robinhood.  

Examine opportunity cost, spreads with fees included, and more. 👇 Check out our demo below 👇  

[![Watch the demo on YouTube](https://img.youtube.com/vi/Cgbfiwm72gk/0.jpg)](https://youtu.be/Cgbfiwm72gk)


## Overview

This tool helps users identify and calculate profitable arbitrage opportunities between different prediction markets. It supports both binary and multiple-choice markets, providing real-time calculations of potential profits and required position sizes.

## Features

- Live prices: paste a Kalshi or Polymarket link to fill in the ask prices
- Binary markets: Yes on one venue + No on another
- Multiple-choice markets: Yes on every option, or No on every option
- Venue fees included (see `FEE_RULES` in `src/lib/arbitrage.ts`)
- Position size, payout, return, and simple annualized return

## Usage

1. Select market type (Binary or Multiple Choice)
2. Enter contract prices from different markets
3. Input principal amount and contract length (optional)
4. View calculated arbitrage opportunities and potential profits

## Development

```sh
corepack enable
pnpm install
pnpm dev     # http://localhost:3000
pnpm test    # arbitrage math tests (node --test)
pnpm lint
```

## Market Compatibility

The calculator works with markets that have:
- Identical outcome conditions
- Matching timeframes
- Compatible price structures

### Supported Markets (UI)
- Kalshi
- Polymarket
- Robinhood
Technically can be used for anything which has corresponding markets.

## Best Practices
- Verify market conditions match exactly before placing trades
- Consider liquidity levels for better fill probability
- Check each venue's current fee schedule against `FEE_RULES`
- Double-check all calculations before executing trades


## Roadmap
- [ ] Market condition matching automation
- [x] Pull live prices from a Kalshi / Polymarket link
- [ ] Search markets by name and match them across venues
- [ ] Advanced portfolio management features (alerts, etc.)

## Disclaimer

This tool is for informational purposes only. Always conduct your own research and consider the risks before trading. We are not responsible for the accuracy of this data
