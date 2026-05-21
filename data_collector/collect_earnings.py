"""
Collect earnings calendar — scrapes kr.investing.com/earnings-calendar,
falls back to yfinance for dates not covered by scraping.
"""
import json
import re
from datetime import datetime, timedelta

try:
    import requests
    from bs4 import BeautifulSoup
    HAS_SCRAPE = True
except ImportError:
    HAS_SCRAPE = False

try:
    import yfinance as yf
except ImportError:
    yf = None

try:
    import pytz
    KST = pytz.timezone('Asia/Seoul')
    def now_kst():
        return datetime.now(KST)
except ImportError:
    from datetime import timezone, timedelta as td
    def now_kst():
        return datetime.now(timezone(td(hours=9)))

# Investing.com country IDs: 5=US
INVEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://kr.investing.com/earnings-calendar/',
    'Content-Type': 'application/x-www-form-urlencoded',
}

CAP_TIER_MAP = {
    'AAPL':'large','MSFT':'large','NVDA':'large','AMZN':'large','GOOGL':'large',
    'META':'large','TSLA':'large','JPM':'large','V':'large','UNH':'large',
    'AVGO':'large','XOM':'large','LLY':'large','MA':'large','HD':'large',
    'COST':'large','NFLX':'large','AMD':'large','ORCL':'large','ADBE':'large',
    'BAC':'large','GS':'large','WMT':'large','TGT':'large','LOW':'large',
    'INTU':'large','QCOM':'large','CSCO':'large','PANW':'large','BIDU':'large',
    'ROSS':'large','AMAT':'large','CRM':'large','ACN':'large',
    'REGN':'large','GILD':'large','VRTX':'large','ISRG':'large',
    'NEE':'large','TMO':'large','ABT':'large',
}

WEEKDAY_KR = ['월', '화', '수', '목', '금', '토', '일']


def get_week_range(offset: int):
    today = now_kst()
    monday = today - timedelta(days=today.weekday()) + timedelta(weeks=offset)
    friday = monday + timedelta(days=4)
    return monday.strftime('%Y-%m-%d'), friday.strftime('%Y-%m-%d')


def _cap_tier(mktcap: int) -> str:
    if mktcap >= 10_000_000_000:
        return 'large'
    if mktcap >= 2_000_000_000:
        return 'mid'
    return 'small'


def _mktcap_from_str(s: str) -> int:
    """Convert '12.3B' / '456M' strings to int."""
    if not s:
        return 0
    s = s.strip().upper().replace(',', '')
    m = re.match(r'([\d.]+)\s*([BMK]?)', s)
    if not m:
        return 0
    val = float(m.group(1))
    suffix = m.group(2)
    if suffix == 'B':
        return int(val * 1_000_000_000)
    if suffix == 'M':
        return int(val * 1_000_000)
    if suffix == 'K':
        return int(val * 1_000)
    return int(val)


def fetch_investing_week(date_from: str, date_to: str) -> list:
    """Scrape kr.investing.com earnings calendar for a date range."""
    if not HAS_SCRAPE:
        return []
    url = 'https://kr.investing.com/earnings-calendar/Service/getCalendarFilteredData'
    form = {
        'country[]': ['5'],   # US only
        'dateFrom': date_from,
        'dateTo': date_to,
        'currentTab': 'custom',
        'submitFilters': '1',
        'limit_from': '0',
    }
    try:
        resp = requests.post(url, headers=INVEST_HEADERS, data=form, timeout=20)
        data = resp.json()
        html = data.get('data', '')
        soup = BeautifulSoup(html, 'html.parser')
        items = []
        current_date = date_from

        for row in soup.select('tr'):
            # Date header row
            if 'theDay' in row.get('class', []) or row.get('id', '').startswith('earningsDate'):
                date_el = row.select_one('td')
                if date_el:
                    raw = date_el.get_text(strip=True)
                    # Try to parse "2025년 5월 19일" or "May 19, 2025"
                    try:
                        parsed = datetime.strptime(raw, '%B %d, %Y')
                        current_date = parsed.strftime('%Y-%m-%d')
                    except Exception:
                        try:
                            # Korean date format
                            m = re.search(r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일', raw)
                            if m:
                                current_date = f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"
                        except Exception:
                            pass
                continue

            # Earnings row
            if not row.get('data-event-datetime') and 'js-earnings-item' not in row.get('class', []):
                ticker_el = row.select_one('.earnCalCompanyName a, [class*="companyName"] a')
                if not ticker_el:
                    continue

            ticker_el = row.select_one('.earnCalCompanyName a, td a[href*="equities"]')
            if not ticker_el:
                continue

            company = ticker_el.get_text(strip=True)
            ticker_raw = row.get('data-url-name', '')
            # Try to extract ticker from the symbol cell
            sym_el = row.select_one('.earnCalCompanyName span, [class*="symbol"]')
            ticker = sym_el.get_text(strip=True) if sym_el else ticker_raw.upper()[:6]

            # EPS cells
            cells = row.select('td')
            eps_actual_str = cells[2].get_text(strip=True) if len(cells) > 2 else ''
            eps_fore_str   = cells[3].get_text(strip=True) if len(cells) > 3 else ''
            rev_actual_str = cells[4].get_text(strip=True) if len(cells) > 4 else ''
            rev_fore_str   = cells[5].get_text(strip=True) if len(cells) > 5 else ''
            timing_str     = cells[1].get_text(strip=True) if len(cells) > 1 else ''

            def parse_eps(s: str):
                s = s.strip().replace(',', '')
                try:
                    return round(float(s), 2)
                except Exception:
                    return None

            eps_actual  = parse_eps(eps_actual_str)
            eps_fore    = parse_eps(eps_fore_str)
            surprise    = None
            if eps_actual is not None and eps_fore:
                try:
                    surprise = round((eps_actual - eps_fore) / abs(eps_fore) * 100, 1)
                except Exception:
                    pass

            # BMO / AMC
            timing = 'AMC'
            if 'before' in timing_str.lower() or 'bmo' in timing_str.lower() or '개장 전' in timing_str:
                timing = 'BMO'

            try:
                dt = datetime.strptime(current_date, '%Y-%m-%d')
                weekday_kr = WEEKDAY_KR[dt.weekday()]
            except Exception:
                weekday_kr = ''

            mktcap = _mktcap_from_str(cells[6].get_text(strip=True) if len(cells) > 6 else '')
            tier = CAP_TIER_MAP.get(ticker.upper(), _cap_tier(mktcap))

            items.append({
                'ticker': ticker.upper() or company[:6],
                'company': company,
                'date': current_date,
                'weekday': weekday_kr,
                'timing': timing,
                'time_str': '미정',
                'market_cap': mktcap,
                'market_cap_tier': tier,
                'eps_estimate': eps_fore,
                'eps_actual': eps_actual,
                'surprise_pct': surprise,
            })

        return items
    except Exception as e:
        print(f"  Investing.com earnings scrape failed: {e}")
        return []


def fetch_yfinance_week(start: str, end: str) -> list:
    """Fallback: fetch earnings from yfinance for a known watchlist."""
    if yf is None:
        return []
    WATCHLIST = [
        'AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','JPM','V','UNH',
        'AVGO','XOM','LLY','MA','HD','COST','NFLX','AMD','ORCL','ADBE',
        'BAC','GS','WMT','TGT','LOW','INTU','QCOM','CSCO','PANW','BIDU',
        'ROSS','AMAT','CRM','ACN','NEE','TMO','ABT','REGN',
    ]
    s_dt = datetime.strptime(start, '%Y-%m-%d')
    e_dt = datetime.strptime(end, '%Y-%m-%d')
    items = []
    for sym in WATCHLIST:
        try:
            t = yf.Ticker(sym)
            cal = t.calendar
            if cal is None:
                continue
            date_val = cal.get('Earnings Date') or cal.get('earningsDate')
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

            weekday_kr = WEEKDAY_KR[earn_dt.weekday()]
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
                'market_cap_tier': CAP_TIER_MAP.get(sym, _cap_tier(mktcap)),
                'eps_estimate': eps_est_val,
                'eps_actual': eps_act_val,
                'surprise_pct': surprise,
            })
        except Exception:
            continue
    items.sort(key=lambda x: x['date'])
    return items


def fetch_week(start: str, end: str) -> list:
    items = fetch_investing_week(start, end)
    if not items:
        print(f"  → Investing.com returned nothing, using yfinance fallback")
        items = fetch_yfinance_week(start, end)
    items.sort(key=lambda x: x['date'])
    return items


def collect_earnings() -> dict:
    result = {}
    for offset, key in [(-1, 'prev_week'), (0, 'curr_week'), (1, 'next_week')]:
        start, end = get_week_range(offset)
        print(f"  → {key}: {start} ~ {end}")
        items = fetch_week(start, end)
        result[key] = {'range': {'start': start, 'end': end}, 'items': items}
    return {'earnings': result}


if __name__ == '__main__':
    r = collect_earnings()
    print(json.dumps(r, ensure_ascii=False, indent=2))
