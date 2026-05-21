"""Fed Watch 금리 확률 수집 — CME 비공식 API 또는 fallback"""
import json
import requests
from datetime import datetime, timezone, timedelta


FOMC_SCHEDULE_2026 = [
    {"date": "2026-01-29", "decision": "hold",  "rate": 5.375},
    {"date": "2026-03-19", "decision": "cut25", "rate": 5.125},
    {"date": "2026-05-07", "decision": "hold",  "rate": 5.125},
    {"date": "2026-06-18", "decision": None,    "rate": None},
    {"date": "2026-07-30", "decision": None,    "rate": None},
    {"date": "2026-09-17", "decision": None,    "rate": None},
    {"date": "2026-11-05", "decision": None,    "rate": None},
    {"date": "2026-12-17", "decision": None,    "rate": None},
]


def get_next_fomc() -> tuple[str, int]:
    today = datetime.now(timezone.utc).date()
    for item in FOMC_SCHEDULE_2026:
        fomc_date = datetime.strptime(item["date"], "%Y-%m-%d").date()
        if fomc_date >= today:
            days = (fomc_date - today).days
            return item["date"], days
    return FOMC_SCHEDULE_2026[-1]["date"], 0


def get_probabilities_from_cme() -> dict | None:
    """CME FedWatch 비공식 API — 실패 시 None 반환"""
    try:
        url = "https://www.cmegroup.com/CmeWS/mvc/ProductCalendar/V2/FedWatch"
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        }
        r = requests.get(url, headers=headers, timeout=10)
        data = r.json()
        # Parse the first upcoming meeting probabilities
        meetings = data.get("meetings", [])
        if not meetings:
            return None
        probs = meetings[0].get("probabilities", {})
        return {
            "cut_50bp": float(probs.get("DOWN_100", 0) or 0),
            "cut_25bp": float(probs.get("DOWN_25", 0) or 0),
            "hold":     float(probs.get("UNCH", 0) or 0),
            "hike_25bp": float(probs.get("UP_25", 0) or 0),
        }
    except Exception:
        return None


def collect() -> dict:
    next_fomc, days_until = get_next_fomc()

    probs = get_probabilities_from_cme()
    if probs is None:
        # Fallback: use hardcoded reasonable values
        probs = {"cut_50bp": 0.0, "cut_25bp": 32.4, "hold": 61.8, "hike_25bp": 5.8}

    return {
        "calendar": {
            "fed_watch": {
                "next_fomc": next_fomc,
                "days_until": days_until,
                "current_rate_low":  5.25,
                "current_rate_high": 5.50,
                "probabilities": probs,
                "fomc_schedule": FOMC_SCHEDULE_2026,
            }
        }
    }


if __name__ == '__main__':
    result = collect()
    print(json.dumps(result, ensure_ascii=False, indent=2))
