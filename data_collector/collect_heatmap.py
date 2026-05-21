"""히트맵 종목 데이터 수집 — yfinance (미국) + pykrx (한국)"""
import json
import yfinance as yf
from pykrx import stock
from datetime import datetime, timedelta


SP500_TICKERS = [
    "AAPL","MSFT","NVDA","AMZN","GOOGL","META","TSLA","BRK-B","JPM","UNH",
    "V","JNJ","XOM","LLY","AVGO","MA","HD","PG","COST","MRK",
    "ABBV","CVX","ORCL","BAC","KO","PEP","TMO","MCD","CSCO","WMT",
    "ACN","CRM","ABT","ADBE","TXN","NKE","DHR","NEE","NFLX","AMD",
    "BMY","RTX","QCOM","HON","UPS","LOW","GS","MS","SBUX","INTU",
]

NASDAQ100_TICKERS = [
    "AAPL","MSFT","NVDA","AMZN","GOOGL","META","TSLA","AVGO","ORCL","ADBE",
    "CSCO","NFLX","AMD","QCOM","INTU","AMAT","MU","LRCX","PANW","SNPS",
    "CDNS","MRVL","KLAC","FTNT","ADI","REGN","MDLZ","PYPL","GILD",
    "ABNB","DXCM","TEAM","VRSK","IDXX","CTAS","ROST","PCAR","ODFL",
]

KOSPI_TICKERS = [
    "005930","000660","373220","207940","005380","068270","005490",
    "105560","055550","051910","035420","035720","006400","000270","003550",
    "096770","018260","086790","015760","323410",
]


def collect_us(tickers: list[str]) -> list[dict]:
    result = []
    try:
        data = yf.download(tickers, period="2d", auto_adjust=True, progress=False)
        closes = data["Close"]
        info_cache: dict[str, dict] = {}

        for sym in tickers:
            try:
                if sym not in closes.columns:
                    continue
                prices = closes[sym].dropna()
                if len(prices) < 2:
                    continue
                curr = float(prices.iloc[-1])
                prev = float(prices.iloc[-2])
                change_pct = round((curr - prev) / prev * 100, 2)

                t = yf.Ticker(sym)
                info = t.fast_info
                result.append({
                    "ticker": sym,
                    "price": round(curr, 2),
                    "change_pct": change_pct,
                    "market_cap": int(getattr(info, 'market_cap', 0) or 0),
                    "pe_ratio": round(float(t.info.get("trailingPE", 0) or 0), 1),
                    "forward_pe": round(float(t.info.get("forwardPE", 0) or 0), 1),
                    "week52_high": round(float(getattr(info, 'fifty_two_week_high', 0) or 0), 2),
                    "week52_low":  round(float(getattr(info, 'fifty_two_week_low', 0) or 0), 2),
                    "dividend_yield": round(float(t.info.get("dividendYield", 0) or 0), 4),
                })
            except Exception as e:
                print(f"  {sym}: {e}")
    except Exception as e:
        print(f"US bulk download error: {e}")
    return result


def collect_kospi(date: str | None = None) -> list[dict]:
    if date is None:
        d = datetime.now()
        while d.weekday() >= 5:
            d -= timedelta(days=1)
        date = d.strftime('%Y%m%d')

    result = []
    try:
        df = stock.get_market_ohlcv_by_ticker(date, market="KOSPI")
        cap_df = stock.get_market_cap(date)

        for ticker in KOSPI_TICKERS:
            try:
                if ticker not in df.index:
                    continue
                row = df.loc[ticker]
                price = int(row['종가'])
                change_pct = round(float(row['등락률']), 2)
                market_cap = int(cap_df.loc[ticker, '시가총액']) if ticker in cap_df.index else 0
                name = stock.get_market_ticker_name(ticker)
                result.append({
                    "ticker": ticker,
                    "name": name,
                    "price": price,
                    "change_pct": change_pct,
                    "market_cap": market_cap,
                })
            except Exception as e:
                print(f"  {ticker}: {e}")
    except Exception as e:
        print(f"KOSPI heatmap error: {e}")
    return result


def collect() -> dict:
    print("  [heatmap] SP500...")
    sp500 = collect_us(SP500_TICKERS)
    print("  [heatmap] NASDAQ100...")
    nasdaq100 = collect_us(NASDAQ100_TICKERS)
    print("  [heatmap] KOSPI...")
    kospi = collect_kospi()
    return {"heatmap": {"sp500": sp500, "nasdaq100": nasdaq100, "kospi": kospi}}


if __name__ == '__main__':
    result = collect()
    print(json.dumps(result, ensure_ascii=False, indent=2))
