"""경제 일정 수집 — 수동 JSON 관리 방식 (자동화 시 Investing.com RSS 활용)"""
import json
from datetime import datetime


def collect() -> dict:
    """
    경제 일정은 자동 수집이 어려우므로 이 파일을 직접 수정하거나
    Investing.com 캘린더를 파싱하는 방식으로 업데이트.
    현재는 빈 리스트 반환 — 실제 사용 시 아래 형식으로 채움.
    """
    calendar = [
        # {
        #     "date": "2026-06-11",
        #     "event": "FOMC 금리결정",
        #     "importance": "high",
        #     "expected": "4.25%",
        #     "previous": "4.25%"
        # },
    ]

    earnings = [
        # {
        #     "ticker": "NVDA",
        #     "name": "NVIDIA",
        #     "date": "2026-05-28",
        #     "eps_expected": 0.74,
        #     "eps_actual": None,
        #     "surprise_pct": None
        # },
    ]

    return {
        'calendar': calendar,
        'earnings': earnings,
    }


if __name__ == '__main__':
    result = collect()
    print(json.dumps(result, ensure_ascii=False, indent=2))
