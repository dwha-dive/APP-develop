"""
Collect US heatmap data for S&P500, NASDAQ100, DOW30 using yfinance.
"""
import json

try:
    import yfinance as yf
except ImportError:
    yf = None

SP500_TICKERS = [
    'AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','JPM','V','UNH',
    'AVGO','XOM','LLY','MA','HD','COST','NFLX','AMD','ORCL','ADBE',
    'CRM','ACN','MCD','NKE','TMO','ABT','DHR','NEE','AMAT','PANW',
]

NASDAQ100_TICKERS = [
    'AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','AVGO','NFLX','AMD',
    'ADBE','QCOM','INTU','CSCO','PANW','REGN','GILD','VRTX','ISRG','MDLZ',
]

DOW30_TICKERS = [
    'AAPL','MSFT','JPM','V','HD','GS','CAT','BA','MCD','WMT',
    'UNH','JNJ','PG','CVX','AMGN','MMM','DIS','IBM','HON','VZ',
]

SECTOR_MAP = {
    'AAPL':'기술','MSFT':'기술','NVDA':'기술','AVGO':'기술','AMD':'기술',
    'ADBE':'기술','QCOM':'기술','INTU':'기술','CSCO':'기술','PANW':'기술',
    'ORCL':'기술','CRM':'기술','ACN':'기술','AMAT':'기술',
    'AMZN':'경기소비재','TSLA':'경기소비재','HD':'경기소비재','MCD':'경기소비재',
    'NKE':'경기소비재','DIS':'경기소비재',
    'GOOGL':'통신서비스','META':'통신서비스','NFLX':'통신서비스','VZ':'통신서비스',
    'JPM':'금융','V':'금융','MA':'금융','GS':'금융','BAC':'금융',
    'UNH':'헬스케어','LLY':'헬스케어','TMO':'헬스케어','ABT':'헬스케어',
    'DHR':'헬스케어','REGN':'헬스케어','GILD':'헬스케어','VRTX':'헬스케어',
    'ISRG':'헬스케어','JNJ':'헬스케어','AMGN':'헬스케어',
    'XOM':'에너지','CVX':'에너지',
    'NEE':'유틸리티',
    'COST':'필수소비재','WMT':'필수소비재','PG':'필수소비재','MDLZ':'필수소비재',
    'CAT':'산업재','BA':'산업재','HON':'산업재','UPS':'산업재',
    'IBM':'기술','MMM':'산업재',
}

def fetch_tickers(tickers: list) -> list:
    if yf is None:
        return []
    result = []
    for ticker in tickers:
        try:
            info = yf.Ticker(ticker).fast_info
            hist = yf.Ticker(ticker).history(period='2d')
            if hist.empty or len(hist) < 1:
                continue

            close = float(hist['Close'].iloc[-1])
            prev = float(hist['Close'].iloc[-2]) if len(hist) >= 2 else close
            change_pct = round((close - prev) / prev * 100, 2) if prev else 0.0
            mktcap = int(getattr(info, 'market_cap', 0) or 0)

            result.append({
                'ticker': ticker,
                'name': ticker,
                'sector': SECTOR_MAP.get(ticker, '기타'),
                'price': round(close, 2),
                'change_pct': change_pct,
                'market_cap': mktcap,
            })
        except Exception:
            continue
    return result

def collect_us_heatmap() -> dict:
    sp500  = fetch_tickers(SP500_TICKERS)
    nasdaq = fetch_tickers(NASDAQ100_TICKERS)
    dow    = fetch_tickers(DOW30_TICKERS)
    return {
        'heatmap': {
            'sp500':     sp500,
            'nasdaq100': nasdaq,
            'dow30':     dow,
        }
    }

if __name__ == '__main__':
    result = collect_us_heatmap()
    print(json.dumps(result, indent=2))
