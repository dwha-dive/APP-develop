"""전체 데이터 수집 실행 → public/data.json 생성"""
import json
import sys
import os
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))

sys.path.insert(0, os.path.dirname(__file__))

from collect_kr_market  import collect as collect_kr
from collect_us_market  import collect as collect_us
from collect_temperature import collect as collect_temp
from collect_calendar   import collect as collect_cal


def merge(*dicts: dict) -> dict:
    result = {}
    for d in dicts:
        result.update(d)
    return result


def main():
    print('▶ 데이터 수집 시작')

    print('  [1/4] 한국 증시 + 수급...')
    kr = collect_kr()

    print('  [2/4] 미국 증시 + 매크로...')
    us = collect_us()

    print('  [3/4] 시장 온도 지수...')
    temp = collect_temp()

    print('  [4/4] 경제 일정...')
    cal = collect_cal()

    data = merge(
        {'updated_at': datetime.now(KST).isoformat(timespec='seconds')},
        temp,
        kr,
        us,
        cal,
    )

    out_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data.json')
    out_path = os.path.abspath(out_path)

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'✅ data.json 저장 완료 → {out_path}')


if __name__ == '__main__':
    main()
