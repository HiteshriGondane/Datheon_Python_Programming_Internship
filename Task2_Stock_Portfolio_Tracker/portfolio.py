"""Stock Portfolio Performance Tracker - Internship Task 2.
Run with: python portfolio.py
Optional market_prices.csv columns: ticker,current_price
"""
import csv
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
PRICE_FILE = HERE / "market_prices.csv"
SUMMARY_FILE = HERE / "portfolio_summary.csv"
FIELDS = ["timestamp", "ticker", "buy_price", "quantity", "current_price",
          "invested_amount", "current_market_value", "gain_loss", "return_percent"]


def load_prices():
    prices = {}
    if PRICE_FILE.exists():
        try:
            with PRICE_FILE.open(newline="", encoding="utf-8-sig") as f:
                for row in csv.DictReader(f):
                    ticker = (row.get("ticker") or "").strip().upper()
                    try:
                        price = float(row.get("current_price", ""))
                        if ticker and price > 0:
                            prices[ticker] = price
                    except ValueError:
                        pass
        except OSError as exc:
            print(f"Could not read market_prices.csv: {exc}")
    return prices


def positive_float(prompt):
    while True:
        try:
            value = float(input(prompt).strip().replace(",", ""))
            if value > 0:
                return value
        except ValueError:
            pass
        print("Enter a valid number greater than zero.")


def positive_int(prompt):
    while True:
        try:
            value = int(input(prompt).strip())
            if value > 0:
                return value
        except ValueError:
            pass
        print("Enter a positive whole number.")


def current_price_for(ticker, prices):
    if ticker in prices:
        print(f"CSV price for {ticker}: {prices[ticker]:,.2f}")
        if input("Use this price? (Y/n): ").strip().lower() in ("", "y", "yes"):
            return prices[ticker]
    return positive_float(f"Enter current market price for {ticker}: ")


def calculate(ticker, buy, qty, current):
    invested = buy * qty
    market_value = current * qty
    gain = market_value - invested
    return {
        "ticker": ticker, "buy_price": buy, "quantity": qty,
        "current_price": current, "invested_amount": invested,
        "current_market_value": market_value, "gain_loss": gain,
        "return_percent": (gain / invested * 100) if invested else 0.0
    }


def show_summary(positions):
    invested = sum(p["invested_amount"] for p in positions)
    market = sum(p["current_market_value"] for p in positions)
    gain = market - invested
    pct = gain / invested * 100 if invested else 0
    print("\n" + "=" * 100)
    print("STOCK PORTFOLIO PERFORMANCE SUMMARY")
    print("=" * 100)
    print(f"{'Ticker':<9}{'Buy price':>12}{'Shares':>9}{'Current':>12}"
          f"{'Invested':>14}{'Market value':>15}{'Gain/Loss':>13}{'Return':>11}")
    print("-" * 100)
    for p in positions:
        print(f"{p['ticker']:<9}{p['buy_price']:>12,.2f}{p['quantity']:>9}"
              f"{p['current_price']:>12,.2f}{p['invested_amount']:>14,.2f}"
              f"{p['current_market_value']:>15,.2f}{p['gain_loss']:>+13,.2f}"
              f"{p['return_percent']:>10.2f}%")
    print("-" * 100)
    print(f"{'TOTAL':<42}{invested:>14,.2f}{market:>15,.2f}{gain:>+13,.2f}{pct:>10.2f}%")
    print("Overall:", "PROFIT" if gain > 0 else "LOSS" if gain < 0 else "BREAK-EVEN")
    print("Note: prices are user-provided or loaded from the optional CSV, not live quotes.")


def save_log(positions):
    exists = SUMMARY_FILE.exists() and SUMMARY_FILE.stat().st_size > 0
    timestamp = datetime.now().astimezone().isoformat(timespec="seconds")
    try:
        with SUMMARY_FILE.open("a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=FIELDS)
            if not exists:
                writer.writeheader()
            for p in positions:
                writer.writerow({"timestamp": timestamp, **{
                    k: (f"{v:.2f}" if k in {
                        "buy_price", "current_price", "invested_amount",
                        "current_market_value", "gain_loss", "return_percent"
                    } else v) for k, v in p.items()
                }})
        print(f"Saved performance log to {SUMMARY_FILE.name}")
    except OSError as exc:
        print(f"Could not save CSV log: {exc}")


def main():
    print("=" * 52)
    print("       STOCK PORTFOLIO PERFORMANCE TRACKER")
    print("=" * 52)
    print("Enter holdings one by one. Type DONE to finish.")
    prices = load_prices()
    positions = []
    while True:
        ticker = input("\nStock ticker (e.g. AAPL) or DONE: ").strip().upper()
        if ticker == "DONE":
            break
        if not ticker or not ticker.replace(".", "").replace("-", "").isalnum():
            print("Enter a valid ticker symbol.")
            continue
        buy = positive_float(f"Buy price per share for {ticker}: ")
        qty = positive_int(f"Number of shares for {ticker}: ")
        current = current_price_for(ticker, prices)
        p = calculate(ticker, buy, qty, current)
        positions.append(p)
        print(f"{ticker}: invested {p['invested_amount']:,.2f}, value "
              f"{p['current_market_value']:,.2f}, gain/loss {p['gain_loss']:+,.2f} "
              f"({p['return_percent']:+.2f}%).")
    if not positions:
        print("No holdings entered. No summary was created.")
        return
    show_summary(positions)
    save_log(positions)


if __name__ == "__main__":
    main()
