"""한국 증시 지수 + 수급 데이터 수집 (pykrx)"""
import json
from datetime import datetime, timedelta
from pykrx import stock


def get_last_business_day() -> str:
    d = datetime.now()
    # 장 마감 후(16:30 KST) 실행되므로 오늘 날짜 사용, 주말이면 금요일
    while d.weekday() >= 5:
        d -= timedelta(days=1)
    return d.strftime('%Y%m%d')


def collect(date: str | None = None) -> dict:
    if date is None:
        date = get_last_business_day()

    prev_date = stock.get_previous_business_days(fromdate=date, todate=date)
    prev_date = prev_date[0].strftime('%Y%m%d') if len(prev_date) > 1 else date

    # 지수
    def get_index(ticker: str) -> dict:
        try:
            df = stock.get_index_ohlcv(date, date, ticker)
            if df.empty:
                return {'value': 0.0, 'change': 0.0}
            row = df.iloc[-1]
            return {
                'value': round(float(row['종가']), 2),
                'change': round(float(row['등락률']), 2),
            }
        except Exception:
            return {'value': 0.0, 'change': 0.0}

    kospi   = get_index('1001')
    kosdaq  = get_index('2001')
    kospi200 = get_index('1028')

    # 수급
    def get_supply(market: str) -> dict:
        try:
            df = stock.get_market_trading_value_by_date(date, date, market)
            if df.empty:
                return {}
            row = df.iloc[-1]
            return {
                f'{market.lower()}_foreign':     int(row.get('외국인합계', 0)),
                f'{market.lower()}_institution': int(row.get('기관합계', 0)),
                f'{market.lower()}_individual':  int(row.get('개인', 0)),
            }
        except Exception:
            return {}

    kospi_supply  = get_supply('KOSPI')
    kosdaq_supply = get_supply('KOSDAQ')

    # 연기금
    pension = 0
    try:
        df = stock.get_market_trading_value_by_date(date, date, 'KOSPI', detail=True)
        if not df.empty:
            pension = int(df.iloc[-1].get('연기금등', 0))
    except Exception:
        pass

    # 외국인 순매수 Top 10
    def get_top_buy(market: str, investor: str) -> list:
        try:
            df = stock.get_market_net_purchases_of_equities(date, date, market, investor)
            df = df.sort_values('순매수거래량', ascending=False).head(10)
            result = []
            for ticker, row in df.iterrows():
                name = stock.get_market_ticker_name(ticker)
                change = 0.0
                try:
                    ohlcv = stock.get_market_ohlcv(date, date, ticker)
                    if not ohlcv.empty:
                        change = round(float(ohlcv.iloc[-1]['등락률']), 2)
                except Exception:
                    pass
                result.append({
                    'ticker': ticker,
                    'name': name,
                    'net': int(row.get('순매수거래대금', 0)),
                    'change': change,
                })
            return result
        except Exception:
            return []

    top_foreign  = get_top_buy('KOSPI', '외국인')
    top_institution = get_top_buy('KOSPI', '기관합계')

    # 외국인 20거래일 일별 순매수
    foreign_daily = []
    try:
        end = datetime.strptime(date, '%Y%m%d')
        start = end - timedelta(days=35)
        df = stock.get_market_trading_value_by_date(
            start.strftime('%Y%m%d'), date, 'KOSPI'
        )
        df = df.tail(20)
        for d_idx, row in df.iterrows():
            foreign_daily.append({
                'date': d_idx.strftime('%Y%m%d'),
                'net': int(row.get('외국인합계', 0)),
            })
    except Exception:
        pass

    # 외국인 지분율
    holdings = []
    major_tickers = ['005930', '000660', '035420', '035720', '005380']
    for ticker in major_tickers:
        try:
            name = stock.get_market_ticker_name(ticker)
            df = stock.get_exhaustion_rates_of_foreign_investment(date, date, ticker)
            if not df.empty:
                ratio = round(float(df.iloc[-1].get('지분율', 0)), 2)
            else:
                ratio = 0.0
            # 전일 대비 변화
            prev_df = stock.get_exhaustion_rates_of_foreign_investment(prev_date, prev_date, ticker)
            prev_ratio = round(float(prev_df.iloc[-1].get('지분율', 0)), 2) if not prev_df.empty else ratio
            holdings.append({
                'ticker': ticker,
                'name': name,
                'ratio': ratio,
                'change': round(ratio - prev_ratio, 2),
            })
        except Exception:
            pass

    return {
        'kr_market': {
            'kospi': kospi,
            'kosdaq': kosdaq,
            'kospi200': kospi200,
        },
        'supply_demand': {
            'date': date,
            'kospi_foreign':     kospi_supply.get('kospi_foreign', 0),
            'kospi_institution': kospi_supply.get('kospi_institution', 0),
            'kosdaq_foreign':    kosdaq_supply.get('kosdaq_foreign', 0),
            'pension':           pension,
            'individual':        kospi_supply.get('kospi_individual', 0),
            'top_buy_foreign':   top_foreign,
            'top_buy_institution': top_institution,
            'foreign_daily':     foreign_daily,
            'foreign_holdings':  holdings,
        },
    }


if __name__ == '__main__':
    result = collect()
    print(json.dumps(result, ensure_ascii=False, indent=2))
