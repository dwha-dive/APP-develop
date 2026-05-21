"""어닝 캘린더 수집 — yfinance"""
import json
import yfinance as yf
from datetime import datetime, timedelta

WATCHLIST = [
    "AAPL","MSFT","NVDA","AMZN","GOOGL","META","TSLA",
    "JPM","BAC","GS","UNH","V","MA","COST","TGT","WMT",
]


def collect() -> list[dict]:
    earnings = []
    today = datetime.now()
    window_start = today - timedelta(days=3)
    window_end = today + timedelta(days=14)

    for sym in WATCHLIST:
        try:
            t = yf.Ticker(sym)
            cal = t.calendar
            if cal is None or cal.empty:
                continue

            date_val = cal.get("Earnings Date")
            if date_val is None:
                continue

            # calendar returns a dict or DataFrame depending on version
            if hasattr(date_val, '__iter__') and not isinstance(date_val, str):
                earn_date = list(date_val)[0]
            else:
                earn_date = date_val

            if hasattr(earn_date, 'date'):
                earn_date = earn_date.date()

            if not (window_start.date() <= earn_date <= window_end.date()):
                continue

            eps_est = cal.get("EPS Estimate")
            eps_act = cal.get("Reported EPS")
            eps_est_val = float(eps_est) if eps_est is not None and str(eps_est) != 'nan' else None
            eps_act_val = float(eps_act) if eps_act is not None and str(eps_act) != 'nan' else None

            surprise = None
            if eps_est_val and eps_act_val:
                surprise = round((eps_act_val - eps_est_val) / abs(eps_est_val) * 100, 1)

            info = t.info
            earnings.append({
                "date": str(earn_date),
                "ticker": sym,
                "company": info.get("shortName", sym),
                "timing": "AMC",  # yfinance doesn't reliably provide BMO/AMC
                "eps_estimate": round(eps_est_val, 2) if eps_est_val else None,
                "eps_actual":   round(eps_act_val, 2) if eps_act_val else None,
                "surprise_pct": surprise,
            })
        except Exception as e:
            print(f"  {sym} earnings error: {e}")

    earnings.sort(key=lambda x: x["date"])
    return earnings


if __name__ == '__main__':
    result = collect()
    print(json.dumps(result, ensure_ascii=False, indent=2))
