# Event Contract Arbitrage Calculator 📈

A Next.js-based web application for calculating arbitrage opportunities across prediction markets like Kalshi and Polymarket.

## Overview

This tool helps users identify and calculate profitable arbitrage opportunities between different prediction markets. It supports both binary and multiple-choice markets, providing real-time calculations of potential profits and required position sizes.

## Features

- Binary market arbitrage calculations
- Multiple-choice market analysis
- Cross-market arbitrage detection
- Contract length and annualized ROI calculations
- Gas fee considerations for Polymarket trades
- Real-time profit calculations

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone [your-repository-url]

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Select market type (Binary or Multiple Choice)
2. Enter contract prices from different markets
3. Input principal amount and contract length (optional)
4. View calculated arbitrage opportunities and potential profits

## Market Compatibility

The calculator works with markets that have:
- Identical outcome conditions
- Matching timeframes
- Compatible price structures

### Supported Markets
- Kalshi
- Polymarket

## Best Practices

- Verify market conditions match exactly before placing trades
- Consider liquidity levels for better fill probability
- Account for gas fees when trading on Polymarket
- Double-check all calculations before executing trades

## Technical Details

Built with:
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Your chosen license]

## Roadmap

- [ ] Automated gas fee profitability calculations
- [ ] Market condition matching automation
- [ ] Additional market integrations
- [ ] Advanced portfolio management features

## Disclaimer

This tool is for informational purposes only. Always conduct your own research and consider the risks before trading.
