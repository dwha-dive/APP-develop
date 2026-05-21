"""Collect real-time header ticker data from Yahoo Finance."""
import json

try:
    import yfinance as yf
except ImportError:
    yf = None

TICKERS = {
    'sp500':   '^GSPC',
    'nasdaq':  '^IXIC',
    'usd_krw': 'USDKRW=X',
    'bitcoin': 'BTC-USD',
    'kospi':   '^KS11',
    'kosdaq':  '^KQ11',
}

def collect_header_tickers() -> dict:
    result = {}
    for key, sym in TICKERS.items():
        try:
            if yf is None:
                result[key] = {'value': 0, 'change_pct': 0}
                continue
            hist = yf.Ticker(sym).history(period='2d')
            if hist.empty:
                result[key] = {'value': 0, 'change_pct': 0}
                continue
            price = float(hist['Close'].iloc[-1])
            prev  = float(hist['Close'].iloc[-2]) if len(hist) >= 2 else price
            chg   = round((price - prev) / prev * 100, 2) if prev else 0.0
            result[key] = {'value': round(price, 2), 'change_pct': chg}
        except Exception as e:
            print(f"  ⚠️ header {key} ({sym}): {e}")
            result[key] = {'value': 0, 'change_pct': 0}

    return {'header_tickers': result}

if __name__ == '__main__':
    r = collect_header_tickers()
    print(json.dumps(r, indent=2))
