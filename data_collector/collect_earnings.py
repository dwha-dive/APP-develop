"""
Collect earnings calendar — prev/curr/next week using yfinance.
"""
import json
from datetime import datetime, timedelta

try:
    import yfinance as yf
except ImportError:
    yf = None

WATCHLIST = [
    'AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','JPM','V','UNH',
    'AVGO','XOM','LLY','MA','HD','COST','NFLX','AMD','ORCL','ADBE',
    'BAC','GS','WMT','TGT','LOW','INTU','QCOM','CSCO','PANW','BIDU',
    'ROSS','AMAT','CRM','ACN','NEE','TMO','ABT','REGN',
]

CAP_TIER = {
    'AAPL':'large','MSFT':'large','NVDA':'large','AMZN':'large','GOOGL':'large',
    'META':'large','TSLA':'large','JPM':'large','V':'large','UNH':'large',
    'AVGO':'large','XOM':'large','LLY':'large','MA':'large','HD':'large',
    'COST':'large','NFLX':'large','AMD':'large','ORCL':'large','ADBE':'large',
    'BAC':'large','GS':'large','WMT':'large','TGT':'large','LOW':'large',
    'INTU':'large','QCOM':'large','CSCO':'large','PANW':'large','BIDU':'large',
    'ROSS':'large','AMAT':'large','CRM':'large','ACN':'large',
}

def get_week_range(offset: int):
    today = datetime.now()
    monday = today - timedelta(days=today.weekday()) + timedelta(weeks=offset)
    friday = monday + timedelta(days=4)
    return monday.strftime('%Y-%m-%d'), friday.strftime('%Y-%m-%d')

def fetch_week(start: str, end: str) -> list:
    if yf is None:
        return []
    items = []
    s_dt = datetime.strptime(start, '%Y-%m-%d')
    e_dt = datetime.strptime(end, '%Y-%m-%d')

    for sym in WATCHLIST:
        try:
            t = yf.Ticker(sym)
            cal = t.calendar
            if cal is None:
                continue

            date_val = (cal.get('Earnings Date') or cal.get('earningsDate'))
            if date_val is None:
                continue

            if hasattr(date_val, '__iter__') and not isinstance(date_val, str):
                earn_date = list(date_val)[0]
            else:
                earn_date = date_val

            if hasattr(earn_date, 'date'):
                earn_date = earn_date.date()

            earn_dt = datetime.strptime(str(earn_date), '%Y-%m-%d')
            if not (s_dt <= earn_dt <= e_dt):
                continue

            weekday_idx = earn_dt.weekday()
            weekday_kr = ['월','화','수','목','금','토','일'][weekday_idx]

            eps_est_val = None
            eps_act_val = None
            eps_est = cal.get('EPS Estimate')
            eps_act = cal.get('Reported EPS')
            if eps_est is not None and str(eps_est) != 'nan':
                try: eps_est_val = round(float(eps_est), 2)
                except Exception: pass
            if eps_act is not None and str(eps_act) != 'nan':
                try: eps_act_val = round(float(eps_act), 2)
                except Exception: pass

            surprise = None
            if eps_est_val and eps_act_val:
                surprise = round((eps_act_val - eps_est_val) / abs(eps_est_val) * 100, 1)

            info = t.info
            mktcap = int(info.get('marketCap', 0) or 0)

            items.append({
                'ticker': sym,
                'company': info.get('shortName', sym),
                'date': str(earn_date),
                'weekday': weekday_kr,
                'timing': 'AMC',
                'time_str': '미정',
                'market_cap': mktcap,
                'market_cap_tier': CAP_TIER.get(sym, 'large'),
                'eps_estimate': eps_est_val,
                'eps_actual': eps_act_val,
                'surprise_pct': surprise,
            })
        except Exception:
            continue

    items.sort(key=lambda x: x['date'])
    return items

def collect_earnings() -> dict:
    result = {}
    for offset, key in [(-1,'prev_week'), (0,'curr_week'), (1,'next_week')]:
        start, end = get_week_range(offset)
        items = fetch_week(start, end)
        result[key] = {'range': {'start': start, 'end': end}, 'items': items}
    return {'earnings': result}

if __name__ == '__main__':
    r = collect_earnings()
    print(json.dumps(r, ensure_ascii=False, indent=2))
