"""미국 증시 + 매크로 + 글로벌 지수 수집 (yfinance)"""
import json
import yfinance as yf


def safe_get(ticker_sym: str, field: str = 'Close') -> float:
    try:
        t = yf.Ticker(ticker_sym)
        df = t.history(period='2d')
        if df.empty:
            return 0.0
        latest = float(df[field].iloc[-1])
        prev   = float(df[field].iloc[-2]) if len(df) >= 2 else latest
        return latest, round((latest - prev) / prev * 100, 2)
    except Exception:
        return 0.0, 0.0


def safe_value(ticker_sym: str) -> float:
    try:
        t = yf.Ticker(ticker_sym)
        df = t.history(period='5d')
        if df.empty:
            return 0.0
        return round(float(df['Close'].iloc[-1]), 2)
    except Exception:
        return 0.0


def collect() -> dict:
    us_tickers = {
        'sp500':   '^GSPC',
        'nasdaq':  '^IXIC',
        'dow':     '^DJI',
        'russell': '^RUT',
    }
    us_market = {}
    for key, sym in us_tickers.items():
        v, c = safe_get(sym)
        us_market[key] = {'value': round(v, 2), 'change': c}

    macro = {
        'fed_rate':    {'value': safe_value('FEDFUNDS')},  # FRED via yfinance workaround
        'us_10y':      {'value': safe_value('^TNX')},
        'us_2y':       {'value': safe_value('^IRX')},
        'spread_10_2': {'value': round(safe_value('^TNX') - safe_value('^IRX'), 2)},
        'dxy':         {'value': safe_value('DX-Y.NYB')},
        'usd_krw':     {'value': safe_value('KRW=X')},
        'wti':         {'value': safe_value('CL=F')},
        'gold':        {'value': safe_value('GC=F')},
    }

    global_tickers = {
        'nikkei':   '^N225',
        'shanghai': '000001.SS',
        'hangseng': '^HSI',
        'dax':      '^GDAXI',
    }
    global_index = {}
    for key, sym in global_tickers.items():
        v, c = safe_get(sym)
        global_index[key] = {'value': round(v, 2), 'change': c}

    return {
        'us_market':    us_market,
        'macro':        macro,
        'global_index': global_index,
    }


if __name__ == '__main__':
    result = collect()
    print(json.dumps(result, ensure_ascii=False, indent=2))
