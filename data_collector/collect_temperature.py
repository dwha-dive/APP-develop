"""시장 온도 지수 계산 — VIX, Fear&Greed, Forward P/E"""
import json
import requests
import yfinance as yf


def get_vix() -> dict:
    try:
        t = yf.Ticker('^VIX')
        df = t.history(period='2d')
        if df.empty:
            return {'value': 20.0, 'score': 50.0, 'status': '평균 수준'}
        value = round(float(df['Close'].iloc[-1]), 2)
    except Exception:
        value = 20.0

    # 역방향 점수 환산 (최근 10년 백분위 기반)
    if value < 15:
        score = 80 + (15 - value) / 15 * 15
    elif value < 17:
        score = 65 + (17 - value) / 2 * 15
    elif value < 20:
        score = 45 + (20 - value) / 3 * 20
    elif value < 26:
        score = 30 + (26 - value) / 6 * 15
    elif value < 35:
        score = 15 + (35 - value) / 9 * 15
    else:
        score = max(0, 15 - (value - 35) * 0.5)
    score = round(min(100, max(0, score)), 2)

    if value < 15:   status = '매우 낮은 변동성'
    elif value < 17: status = '낮은 변동성'
    elif value < 20: status = '평균 수준'
    elif value < 26: status = '변동성 확대'
    elif value < 35: status = '고변동성'
    else:            status = '극단적 변동성'

    return {'value': value, 'score': score, 'status': status}


def get_fear_greed() -> dict:
    try:
        url = 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata'
        headers = {'User-Agent': 'Mozilla/5.0'}
        r = requests.get(url, headers=headers, timeout=10)
        data = r.json()
        value = round(float(data['fear_and_greed']['score']), 2)
    except Exception:
        value = 50.0

    score = round(value, 2)

    if value < 25:   status = '극단적 공포'
    elif value < 45: status = '공포'
    elif value < 56: status = '중립'
    elif value < 76: status = '탐욕'
    else:            status = '극단적 탐욕'

    return {'value': value, 'score': score, 'status': status}


def get_forward_pe(fallback: float = 21.0) -> dict:
    """
    WSJ Forward P/E — 스크래핑 실패시 fallback 값 사용.
    GitHub Actions에서는 수동 JSON 업데이트 또는 별도 소스 사용 권장.
    """
    value = fallback

    # 점수 환산 (최근 10년 백분위 기반)
    if value < 16:
        score = value / 16 * 15
    elif value < 18:
        score = 15 + (value - 16) / 2 * 15
    elif value < 21:
        score = 30 + (value - 18) / 3 * 25
    elif value < 24:
        score = 55 + (value - 21) / 3 * 20
    else:
        score = 75 + (value - 24) / 4 * 25
    score = round(min(100, max(0, score)), 2)

    if value < 16:   status = '역사적 하단'
    elif value < 18: status = '평균 하단'
    elif value < 21: status = '평균 상단'
    elif value < 24: status = '상단 범위'
    else:            status = '역사적 상단'

    return {'value': value, 'score': score, 'status': status}


def composite_status(score: float) -> tuple[str, str]:
    if score < 20:   return '한파', '불안·공포 극단 구간'
    elif score < 40: return '냉각', '보수적 심리 우세'
    elif score < 60: return '보통', '중립 구간'
    elif score < 80: return '온난', '탐욕 우세·시장 온도 상승 구간'
    else:            return '과열', '극단적 과열 신호'


def collect(forward_pe_value: float | None = None) -> dict:
    vix = get_vix()
    fg  = get_fear_greed()
    pe  = get_forward_pe(forward_pe_value or 21.0)

    composite_score = round(vix['score'] * 0.4 + fg['score'] * 0.4 + pe['score'] * 0.2, 2)
    status, desc = composite_status(composite_score)

    return {
        'temperature': {
            'composite': {'score': composite_score, 'status': status, 'description': desc},
            'vix':        vix,
            'fear_greed': fg,
            'forward_pe': pe,
        }
    }


if __name__ == '__main__':
    result = collect()
    print(json.dumps(result, ensure_ascii=False, indent=2))
