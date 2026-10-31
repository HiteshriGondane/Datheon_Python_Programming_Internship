# Stock Portfolio Performance Tracker

Python Programming Internship — Task 2.

## Features
- Input ticker symbols, buy prices, share quantities, and current prices.
- Optionally load current prices from `market_prices.csv`.
- Calculate invested capital, market value, gain/loss, and percentage return.
- Print a formatted portfolio summary and overall result.
- Append timestamped performance logs to `portfolio_summary.csv`.
- Uses only Python's standard library; no extra packages are required.

## Run
Open this folder in VS Code, open Terminal, and run:
`python portfolio.py`
On some Windows systems use `py portfolio.py`.

Enter each holding's ticker, buy price, quantity, and current market price. Type `DONE` when finished.

## Optional market_prices.csv
Create a file in the same folder with these columns:
```csv
ticker,current_price
AAPL,225.50
MSFT,510.25
NVDA,205.10
```
The numbers above are examples only, not live quotes. The program asks whether to use a matching CSV price or lets you enter one manually.

The supplied S&P 500 constituents dataset contains company/ticker information, not current market prices. It can help identify ticker symbols, but does not provide market valuation.

## Formulas
- Invested amount = buy price × quantity
- Current market value = current price × quantity
- Gain/loss = current market value − invested amount
- Return (%) = gain/loss ÷ invested amount × 100

Educational project only; not investment advice.

