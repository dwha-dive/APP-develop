"""
Collect KOSPI200 and KOSDAQ150 heatmap data using pykrx.
"""
import json
from datetime import datetime, timedelta

try:
    from pykrx import stock as pykrx_stock
except ImportError:
    pykrx_stock = None

SECTOR_MAP = {
    '005930': 'IT', '000660': 'IT', '035420': 'IT', '018260': 'IT', '035720': 'IT',
    '005380': '경기소비재', '000270': '경기소비재',
    '207940': '헬스케어', '068270': '헬스케어', '091990': '헬스케어',
    '006400': '에너지', '096770': '에너지',
    '051910': '소재',
    '003550': '산업재', '015760': '산업재',
    '055550': '금융', '105560': '금융', '086790': '금융',
}

KOSPI200_TICKERS = [
    '005930','000660','035420','005380','207940','068270','006400',
    '051910','003550','035720','055550','105560','000270','096770','018260',
    '066570','028260','011200','034730','032830',
]

KOSDAQ150_TICKERS = [
    '086900','263750','196170','091990','145020',
    '293490','357780','112040','041510','039030',
]

def get_today():
    today = datetime.now()
    for i in range(5):
        d = today - timedelta(days=i)
        if d.weekday() < 5:
            return d.strftime('%Y%m%d')
    return today.strftime('%Y%m%d')

def fetch_stocks(tickers: list, label: str) -> list:
    if pykrx_stock is None:
        return _fallback_stocks(tickers)

    date = get_today()
    result = []
    for ticker in tickers:
        try:
            df = pykrx_stock.get_market_ohlcv_by_date(date, date, ticker)
            if df.empty:
                continue
            row = df.iloc[-1]
            info = pykrx_stock.get_market_fundamental(date, date, ticker)
            per = float(info.iloc[0]['PER']) if not info.empty else None

            cap_df = pykrx_stock.get_market_cap_by_date(date, date, ticker)
            mktcap = int(cap_df.iloc[-1]['시가총액']) if not cap_df.empty else 0

            name = pykrx_stock.get_market_ticker_name(ticker)

            result.append({
                'ticker': ticker,
                'name': name,
                'sector': SECTOR_MAP.get(ticker, '기타'),
                'price': int(row['종가']),
                'change_pct': round(float(row['등락률']), 2),
                'market_cap': mktcap,
                'pe_ratio': round(per, 1) if per else None,
            })
        except Exception:
            continue
    return result

def _fallback_stocks(tickers: list) -> list:
    return []

def collect_kr_heatmap() -> dict:
    kospi200 = fetch_stocks(KOSPI200_TICKERS, 'KOSPI200')
    kosdaq150 = fetch_stocks(KOSDAQ150_TICKERS, 'KOSDAQ150')
    return {
        'heatmap': {
            'kospi200': kospi200,
            'kosdaq150': kosdaq150,
        }
    }

if __name__ == '__main__':
    result = collect_kr_heatmap()
    print(json.dumps(result, ensure_ascii=False, indent=2))
