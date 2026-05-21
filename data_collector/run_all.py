"""전체 데이터 수집 실행 → public/data.json 생성"""
import json
import sys
import os
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))
sys.path.insert(0, os.path.dirname(__file__))

from collect_kr_market    import collect as collect_kr
from collect_us_market    import collect as collect_us
from collect_temperature  import collect as collect_temp
from collect_heatmap      import collect as collect_heatmap
from collect_sectors      import collect as collect_sectors
from collect_earnings     import collect as collect_earnings
from collect_fed_watch    import collect as collect_fed_watch
from collect_economic_cal import collect as collect_eco_cal


def deep_merge(base: dict, override: dict) -> dict:
    result = dict(base)
    for k, v in override.items():
        if k in result and isinstance(result[k], dict) and isinstance(v, dict):
            result[k] = deep_merge(result[k], v)
        else:
            result[k] = v
    return result


def main():
    print('▶ 데이터 수집 시작')

    print('  [1/7] 한국 증시 + 수급...')
    kr = collect_kr()

    print('  [2/7] 미국 증시 + 매크로...')
    us = collect_us()

    print('  [3/7] 시장 온도 지수...')
    temp = collect_temp()

    print('  [4/7] 히트맵 종목 데이터...')
    heatmap = collect_heatmap()

    print('  [5/7] 섹터 ETF...')
    sectors = collect_sectors()

    print('  [6/7] 어닝 + 경제지표 캘린더...')
    earnings = collect_earnings()
    eco_cal = collect_eco_cal()

    print('  [7/7] Fed Watch...')
    fed = collect_fed_watch()

    # Build calendar section
    calendar = {
        "economic": eco_cal.get("calendar_economic", []),
        "earnings":  earnings,
        "fed_watch": fed.get("calendar", {}).get("fed_watch"),
    }

    data = {
        "updated_at": datetime.now(KST).isoformat(timespec='seconds'),
    }
    for piece in [temp, kr, us, heatmap, sectors]:
        data = deep_merge(data, piece)
    data["calendar"] = calendar

    out_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), '..', 'public', 'data.json')
    )
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'✅ data.json 저장 완료 → {out_path}')


if __name__ == '__main__':
    main()
