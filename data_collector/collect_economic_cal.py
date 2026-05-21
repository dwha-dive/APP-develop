"""경제지표 캘린더 수집 — TradingEconomics RSS 또는 수동 JSON"""
import json
import requests
from datetime import datetime, timedelta

try:
    import xml.etree.ElementTree as ET
    HAS_XML = True
except ImportError:
    HAS_XML = False


def fetch_from_rss() -> list[dict]:
    """TradingEconomics RSS 캘린더"""
    try:
        url = "https://tradingeconomics.com/rss/calendar.rss"
        r = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        root = ET.fromstring(r.content)
        items = []
        for item in root.findall(".//item"):
            title = item.findtext("title", "")
            pub_date = item.findtext("pubDate", "")
            desc = item.findtext("description", "")

            try:
                dt = datetime.strptime(pub_date[:25], "%a, %d %b %Y %H:%M:%S")
                date_str = dt.strftime("%Y-%m-%d")
                time_str = dt.strftime("%H:%M")
            except Exception:
                date_str = ""
                time_str = ""

            importance = "medium"
            title_lower = title.lower()
            if any(k in title_lower for k in ["fomc","cpi","nfp","gdp","fed","rate decision","금통위"]):
                importance = "high"
            elif any(k in title_lower for k in ["pmi","retail","housing","unemployment"]):
                importance = "medium"
            else:
                importance = "low"

            items.append({
                "date": date_str,
                "time": time_str,
                "event": title,
                "importance": importance,
                "expected": None,
                "previous": None,
                "actual": None,
                "country": "US",
            })
        return items[:30]
    except Exception as e:
        print(f"RSS fetch failed: {e}")
        return []


def fallback_calendar() -> list[dict]:
    """수동 관리 폴백 데이터"""
    return []


def collect() -> dict:
    events = fetch_from_rss()
    if not events:
        events = fallback_calendar()

    # Filter to upcoming 2 weeks
    today = datetime.now()
    two_weeks = today + timedelta(days=14)
    events = [
        e for e in events
        if e.get("date") and today.strftime("%Y-%m-%d") <= e["date"] <= two_weeks.strftime("%Y-%m-%d")
    ]
    events.sort(key=lambda x: (x.get("date", ""), x.get("time", "")))

    return {"calendar_economic": events}


if __name__ == '__main__':
    result = collect()
    print(json.dumps(result, ensure_ascii=False, indent=2))
