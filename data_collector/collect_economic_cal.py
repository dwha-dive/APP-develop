"""
Economic calendar — Investing.com scraping with fallback.
Produces economic_calendar: {yesterday, today, tomorrow, this_week, next_week}
"""
import json
from datetime import datetime, timedelta

try:
    import requests
    from bs4 import BeautifulSoup
    HAS_SCRAPE = True
except ImportError:
    HAS_SCRAPE = False

try:
    import pytz
    KST = pytz.timezone('Asia/Seoul')
    def now_kst():
        return datetime.now(KST)
except ImportError:
    from datetime import timezone, timedelta as td
    def now_kst():
        return datetime.now(timezone(td(hours=9)))

COUNTRIES = ['5', '6', '4', '25']  # US, KR, EU, JP
FLAG_MAP = {'US':'🇺🇸','KR':'🇰🇷','EU':'🇪🇺','JP':'🇯🇵','CN':'🇨🇳','GB':'🇬🇧','DE':'🇩🇪','FR':'🇫🇷'}

COUNTRY_CODE_MAP = {
    'united states':'US', 'korea':'KR', 'south korea':'KR',
    'euro zone':'EU', 'european union':'EU', 'japan':'JP',
    'china':'CN', 'united kingdom':'GB', 'germany':'DE', 'france':'FR',
}

def fetch_investing(date_str: str) -> list:
    if not HAS_SCRAPE:
        return []
    url = 'https://www.investing.com/economic-calendar/Service/getCalendarFilteredData'
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.investing.com/economic-calendar/',
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    form = {
        'country[]': COUNTRIES,
        'importance[]': ['1','2','3'],
        'dateFrom': date_str,
        'dateTo': date_str,
        'timeZone': '88',
        'timeFilter': 'timeRemain',
        'currentTab': 'custom',
        'submitFilters': '1',
        'limit_from': '0',
    }
    try:
        resp = requests.post(url, headers=headers, data=form, timeout=15)
        soup = BeautifulSoup(resp.json().get('data',''), 'html.parser')
        events = []
        for row in soup.select('tr.js-event-item'):
            time_el   = row.select_one('.time')
            country_el= row.select_one('.flagCur span')
            name_el   = row.select_one('.event a')
            imp_el    = row.select_one('.sentiment')
            actual_el = row.select_one('.act')
            fore_el   = row.select_one('.fore')
            prev_el   = row.select_one('.prev')
            if not name_el:
                continue
            country_raw = (country_el.get('title') or '').lower() if country_el else ''
            country = COUNTRY_CODE_MAP.get(country_raw, 'US')
            bulls = len(imp_el.select('.grayFullBullishIcon')) if imp_el else 1
            importance = max(1, min(3, bulls))
            event_dt = row.get('data-event-datetime','')
            events.append({
                'event_id': event_dt or f"{date_str}-{name_el.text.strip()[:20]}",
                'time_kst': time_el.text.strip() if time_el else '',
                'country': country,
                'flag': FLAG_MAP.get(country,''),
                'name': name_el.text.strip(),
                'importance': importance,
                'actual': (actual_el.text.strip() or None) if actual_el else None,
                'forecast': (fore_el.text.strip() or None) if fore_el else None,
                'previous': (prev_el.text.strip() or None) if prev_el else None,
                'is_next_release': False,
            })
        return events
    except Exception as e:
        print(f"  Investing.com scrape failed for {date_str}: {e}")
        return []

def fetch_week_range(start: str, end: str) -> list:
    all_events = []
    s = datetime.strptime(start, '%Y-%m-%d')
    e = datetime.strptime(end, '%Y-%m-%d')
    current = s
    while current <= e:
        if current.weekday() < 5:
            day_events = fetch_investing(current.strftime('%Y-%m-%d'))
            all_events.extend(day_events)
        current += timedelta(days=1)
    return all_events

def fallback_today() -> list:
    now = now_kst()
    return [
        {
            'event_id': f"{now.strftime('%Y-%m-%d')}-placeholder",
            'time_kst': '--:--',
            'country': 'US',
            'flag': '🇺🇸',
            'name': '데이터 수집 실패 — 직접 확인 필요',
            'importance': 1,
            'actual': None,
            'forecast': None,
            'previous': None,
            'is_next_release': False,
        }
    ]

def collect_economic_cal() -> dict:
    now = now_kst()
    today = now.strftime('%Y-%m-%d')
    yesterday = (now - timedelta(days=1)).strftime('%Y-%m-%d')
    tomorrow  = (now + timedelta(days=1)).strftime('%Y-%m-%d')

    # This week Mon–Fri
    monday = now - timedelta(days=now.weekday())
    friday = monday + timedelta(days=4)
    this_start = monday.strftime('%Y-%m-%d')
    this_end   = friday.strftime('%Y-%m-%d')

    # Next week
    next_monday = monday + timedelta(weeks=1)
    next_friday = next_monday + timedelta(days=4)
    next_start = next_monday.strftime('%Y-%m-%d')
    next_end   = next_friday.strftime('%Y-%m-%d')

    cal = {
        'yesterday': fetch_investing(yesterday) or fallback_today(),
        'today':     fetch_investing(today)     or fallback_today(),
        'tomorrow':  fetch_investing(tomorrow),
        'this_week': fetch_week_range(this_start, this_end),
        'next_week': fetch_week_range(next_start, next_end),
    }

    # Mark next upcoming event in today's list
    now_time = now.strftime('%H:%M')
    for event in cal['today']:
        t = event.get('time_kst','')
        if t and t > now_time and not event.get('actual'):
            event['is_next_release'] = True
            dt_str = f"{today}T{t}:00+09:00"
            event['next_release_datetime'] = dt_str
            break

    return {'economic_calendar': cal}

if __name__ == '__main__':
    r = collect_economic_cal()
    print(json.dumps(r, ensure_ascii=False, indent=2))
