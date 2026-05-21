"""
Session-aware data collector.
KST 15:30~17:00 → Korean session (pykrx)
KST 04:00~07:00 / 20:00~23:59 → US session (yfinance)
"""
import json
import sys
from pathlib import Path
from datetime import datetime

try:
    import pytz
    KST = pytz.timezone('Asia/Seoul')
    now = datetime.now(KST)
except ImportError:
    from datetime import timezone, timedelta
    KST = timezone(timedelta(hours=9))
    now = datetime.now(KST)

hour = now.hour

is_kr_session = 15 <= hour <= 17
is_us_session = (4 <= hour <= 7) or (20 <= hour <= 23)

if '--all' in sys.argv:
    is_kr_session = True
    is_us_session = True

ROOT = Path(__file__).parent.parent
DATA_FILE = ROOT / 'public' / 'data.json'


def load_existing():
    if DATA_FILE.exists():
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def save(data: dict):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def deep_merge(base: dict, update: dict) -> dict:
    result = dict(base)
    for k, v in update.items():
        if k in result and isinstance(result[k], dict) and isinstance(v, dict):
            result[k] = deep_merge(result[k], v)
        else:
            result[k] = v
    return result


data = load_existing()

# Always update macro
print("📊 Collecting macro data...")
try:
    from collect_macro import collect_macro
    data = deep_merge(data, collect_macro())
except Exception as e:
    print(f"  ⚠️  macro: {e}")

if is_kr_session:
    print("🇰🇷 Korean session detected")

    print("  → KR market indices...")
    try:
        from collect_kr_market import collect_kr_market
        data = deep_merge(data, collect_kr_market())
    except Exception as e:
        print(f"  ⚠️  kr_market: {e}")

    print("  → KR heatmap (KOSPI200/KOSDAQ150)...")
    try:
        from collect_kr_heatmap import collect_kr_heatmap
        data = deep_merge(data, collect_kr_heatmap())
    except Exception as e:
        print(f"  ⚠️  kr_heatmap: {e}")

    ts = now.strftime('%Y-%m-%dT%H:%M:%S+09:00')
    if isinstance(data.get('updated_at'), dict):
        data['updated_at']['kr_session'] = ts
    else:
        prev = data.get('updated_at', ts)
        data['updated_at'] = {'kr_session': ts, 'us_session': prev}

if is_us_session:
    print("🇺🇸 US session detected")

    print("  → US market indices...")
    try:
        from collect_us_market import collect_us_market
        data = deep_merge(data, collect_us_market())
    except Exception as e:
        print(f"  ⚠️  us_market: {e}")

    print("  → US heatmap (SP500/NASDAQ100/DOW30)...")
    try:
        from collect_us_heatmap import collect_us_heatmap
        data = deep_merge(data, collect_us_heatmap())
    except Exception as e:
        print(f"  ⚠️  us_heatmap: {e}")

    print("  → Sectors...")
    try:
        from collect_sectors import collect_sectors
        data = deep_merge(data, collect_sectors())
    except Exception as e:
        print(f"  ⚠️  sectors: {e}")

    print("  → Industries...")
    try:
        from collect_industries import collect_industries
        data = deep_merge(data, collect_industries())
    except Exception as e:
        print(f"  ⚠️  industries: {e}")

    print("  → Temperature...")
    try:
        from collect_temperature import collect_temperature
        data = deep_merge(data, collect_temperature())
    except Exception as e:
        print(f"  ⚠️  temperature: {e}")

    print("  → Fed Watch...")
    try:
        from collect_fed_watch import collect_fed_watch
        data = deep_merge(data, {'fed_watch': collect_fed_watch()})
    except Exception as e:
        print(f"  ⚠️  fed_watch: {e}")

    print("  → Earnings calendar (3 weeks)...")
    try:
        from collect_earnings import collect_earnings
        data = deep_merge(data, collect_earnings())
    except Exception as e:
        print(f"  ⚠️  earnings: {e}")

    print("  → Economic calendar...")
    try:
        from collect_economic_cal import collect_economic_cal
        data = deep_merge(data, collect_economic_cal())
    except Exception as e:
        print(f"  ⚠️  economic_cal: {e}")

    ts = now.strftime('%Y-%m-%dT%H:%M:%S+09:00')
    if isinstance(data.get('updated_at'), dict):
        data['updated_at']['us_session'] = ts
    elif isinstance(data.get('updated_at'), str):
        data['updated_at'] = {'kr_session': data['updated_at'], 'us_session': ts}
    else:
        data['updated_at'] = ts

if not is_kr_session and not is_us_session:
    print("⏸  No active session — only macro collected")
    data['updated_at'] = now.strftime('%Y-%m-%dT%H:%M:%S+09:00')

save(data)
print("✅ data.json updated")
