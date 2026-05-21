"""섹터 ETF 등락률 + 이모지 + 대표 종목 수집 (v3)"""
import json

try:
    import yfinance as yf
except ImportError:
    yf = None

SECTOR_ETFS = [
    {"name":"경기소비재","emoji":"🛍️","etf":"XLY", "stocks":["AMZN","TSLA","MCD","NKE"]},
    {"name":"유틸리티",  "emoji":"⚡","etf":"XLU", "stocks":["NEE","DUK","SO"]},
    {"name":"산업재",    "emoji":"🏭","etf":"XLI", "stocks":["HON","UPS","RTX","CAT"]},
    {"name":"통신서비스","emoji":"📡","etf":"XLC", "stocks":["GOOGL","META","NFLX","VZ"]},
    {"name":"헬스케어",  "emoji":"💊","etf":"XLV", "stocks":["UNH","LLY","ABBV","TMO"]},
    {"name":"금융",      "emoji":"💰","etf":"XLF", "stocks":["JPM","BAC","GS","V"]},
    {"name":"기술",      "emoji":"🔧","etf":"XLK", "stocks":["AAPL","MSFT","NVDA","AVGO"]},
    {"name":"필수소비재","emoji":"🧴","etf":"XLP", "stocks":["PG","KO","WMT","COST"]},
    {"name":"에너지",    "emoji":"🛢️","etf":"XLE", "stocks":["XOM","CVX","COP"]},
    {"name":"소재",      "emoji":"⚗️","etf":"XLB", "stocks":["LIN","APD","ECL"]},
    {"name":"부동산",    "emoji":"🏢","etf":"XLRE","stocks":["AMT","PLD","EQIX"]},
]


def get_change(sym: str) -> float:
    if yf is None:
        return 0.0
    try:
        df = yf.Ticker(sym).history(period='2d')
        if len(df) < 2:
            return 0.0
        return round(
            (float(df['Close'].iloc[-1]) - float(df['Close'].iloc[-2])) /
            float(df['Close'].iloc[-2]) * 100, 2
        )
    except Exception:
        return 0.0


def collect_sectors() -> dict:
    all_tickers = list({s for sec in SECTOR_ETFS for s in [sec['etf']] + sec['stocks']})

    closes = None
    if yf is not None:
        try:
            bulk = yf.download(all_tickers, period='2d', auto_adjust=True, progress=False)
            closes = bulk['Close']
        except Exception:
            closes = None

    def change(sym: str) -> float:
        try:
            if closes is not None and sym in closes.columns:
                prices = closes[sym].dropna()
                if len(prices) >= 2:
                    return round(
                        (float(prices.iloc[-1]) - float(prices.iloc[-2])) /
                        float(prices.iloc[-2]) * 100, 2
                    )
        except Exception:
            pass
        return get_change(sym)

    sectors = []
    for sec in SECTOR_ETFS:
        etf_chg = change(sec['etf'])
        stock_changes = [{'ticker': s, 'change_pct': change(s)} for s in sec['stocks']]
        sectors.append({
            'name':       sec['name'],
            'emoji':      sec['emoji'],
            'etf':        sec['etf'],
            'change_pct': etf_chg,
            'stocks':     stock_changes,
        })

    return {'sectors': sectors}


if __name__ == '__main__':
    result = collect_sectors()
    print(json.dumps(result, ensure_ascii=False, indent=2))
