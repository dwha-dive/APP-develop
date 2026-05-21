"""섹터 ETF 등락률 + 대표 종목 수집"""
import json
import yfinance as yf

SECTOR_ETFS = {
    "Technology":        {"etf": "XLK",  "stocks": ["AAPL", "MSFT", "NVDA"]},
    "Healthcare":        {"etf": "XLV",  "stocks": ["UNH", "LLY", "ABBV"]},
    "Financials":        {"etf": "XLF",  "stocks": ["JPM", "BAC", "GS"]},
    "Consumer Discret.": {"etf": "XLY",  "stocks": ["AMZN", "TSLA", "MCD"]},
    "Communication":     {"etf": "XLC",  "stocks": ["GOOGL", "META", "NFLX"]},
    "Industrials":       {"etf": "XLI",  "stocks": ["HON", "UPS", "RTX"]},
    "Consumer Staples":  {"etf": "XLP",  "stocks": ["PG", "KO", "WMT"]},
    "Energy":            {"etf": "XLE",  "stocks": ["XOM", "CVX"]},
    "Utilities":         {"etf": "XLU",  "stocks": ["NEE", "DUK"]},
    "Real Estate":       {"etf": "XLRE", "stocks": ["AMT", "PLD"]},
    "Materials":         {"etf": "XLB",  "stocks": ["LIN", "APD"]},
}


def get_change(sym: str) -> float:
    try:
        df = yf.Ticker(sym).history(period="2d")
        if len(df) < 2:
            return 0.0
        return round((float(df['Close'].iloc[-1]) - float(df['Close'].iloc[-2])) / float(df['Close'].iloc[-2]) * 100, 2)
    except Exception:
        return 0.0


def collect() -> dict:
    sectors = []
    all_tickers = list({s for v in SECTOR_ETFS.values() for s in [v['etf']] + v['stocks']})

    # Bulk download
    try:
        bulk = yf.download(all_tickers, period="2d", auto_adjust=True, progress=False)
        closes = bulk["Close"]
    except Exception:
        closes = None

    def change_from_bulk(sym: str) -> float:
        try:
            if closes is not None and sym in closes.columns:
                prices = closes[sym].dropna()
                if len(prices) >= 2:
                    return round((float(prices.iloc[-1]) - float(prices.iloc[-2])) / float(prices.iloc[-2]) * 100, 2)
        except Exception:
            pass
        return get_change(sym)

    for name, info in SECTOR_ETFS.items():
        etf_change = change_from_bulk(info['etf'])
        stock_changes = [
            {"ticker": s, "change_pct": change_from_bulk(s)}
            for s in info['stocks']
        ]
        sectors.append({
            "name": name,
            "etf": info['etf'],
            "change_pct": etf_change,
            "stocks": stock_changes,
        })

    return {"sectors": sectors}


if __name__ == '__main__':
    result = collect()
    print(json.dumps(result, ensure_ascii=False, indent=2))
