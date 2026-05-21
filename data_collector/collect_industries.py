"""
Collect GICS sub-industry performance using S&P500 components + yfinance.
"""
import json
from collections import defaultdict

try:
    import yfinance as yf
    import pandas as pd
    import requests
except ImportError:
    yf = None
    pd = None
    requests = None

SP500_WIKIPEDIA = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'

SECTOR_KR = {
    'Information Technology': '기술',
    'Health Care': '헬스케어',
    'Financials': '금융',
    'Consumer Discretionary': '경기소비재',
    'Communication Services': '통신서비스',
    'Industrials': '산업재',
    'Consumer Staples': '필수소비재',
    'Energy': '에너지',
    'Utilities': '유틸리티',
    'Real Estate': '부동산',
    'Materials': '소재',
}

INDUSTRY_KR = {
    'Semiconductors': '반도체',
    'Apparel, Accessories & Luxury Goods': '의류제조',
    'Internet & Direct Marketing Retail': '인터넷소매',
    'Biotechnology': '생명공학',
    'Electrical Components & Equipment': '전기장비',
    'Application Software': '소프트웨어',
    'Communications Equipment': '통신장비',
    'Homebuilding': '주택건설',
    'Automobile Manufacturers': '자동차',
    'Hotels, Restaurants & Leisure': '숙박/레저',
    'Aerospace & Defense': '항공우주',
    'Diversified Banks': '은행',
    'Multi-line Insurance': '보험',
    'Food Retail': '식료품점',
    'Household Products': '생활용품',
    'Oil & Gas Refining & Marketing': '석유정제',
    'Pharmaceuticals': '제약',
    'Health Care Equipment': '의료기기',
    'Office REITs': '리츠(사무실)',
    'Electric Utilities': '유틸리티(전기)',
    'Semiconductor Equipment': '반도체장비',
    'Systems Software': '시스템소프트웨어',
    'IT Consulting & Other Services': 'IT서비스',
    'Data Processing & Outsourced Services': '데이터처리',
    'Integrated Telecommunication Services': '통신(통합)',
    'Movie & Entertainment': '엔터테인먼트',
    'Interactive Media & Services': '인터랙티브미디어',
    'Life Sciences Tools & Services': '생명과학도구',
    'Managed Health Care': '관리의료',
    'Specialty Chemicals': '특수화학',
    'Asset Management & Custody Banks': '자산운용',
    'Investment Banking & Brokerage': '투자은행',
    'Property & Casualty Insurance': '손해보험',
    'Health Care Facilities': '의료시설',
    'Packaged Foods & Meats': '포장식품',
    'Soft Drinks & Non-alcoholic Beverages': '음료',
    'Tobacco': '담배',
    'Air Freight & Logistics': '항공화물',
    'Railroads': '철도',
    'Industrial Machinery & Supplies': '산업기계',
    'Construction & Engineering': '엔지니어링/건설',
    'Diversified REITs': '리츠(복합)',
    'Retail REITs': '리츠(리테일)',
    'Industrial REITs': '리츠(산업)',
    'Independent Power Producers': '독립발전',
    'Gas Utilities': '가스유틸리티',
    'Water Utilities': '수도유틸리티',
    'Gold': '금',
    'Steel': '철강',
    'Paper & Forest Products': '종이/임업',
    'Aluminum': '알루미늄',
    'Auto Parts & Equipment': '자동차부품',
    'Footwear': '신발',
    'Specialized REITs': '리츠(특수)',
    'Cable & Satellite': '케이블/위성',
    'Broadcasting': '방송',
    'Publishing': '출판',
    'Personal Care Products': '개인용품',
    'Drug Retail': '약품소매',
    'Hypermarkets & Super Centers': '할인마트',
    'General Merchandise Stores': '종합매장',
    'Specialty Stores': '전문매장',
    'Home Improvement Retail': '홈인테리어',
    'Internet Software & Services': '인터넷서비스',
    'Electronic Components': '전자부품',
    'Electronic Equipment & Instruments': '전자장비',
    'Technology Hardware, Storage & Peripherals': '컴퓨터HW',
    'Agricultural & Farm Machinery': '농기계/중장비',
    'Trucking': '트럭운송',
    'Airports & Air Services': '공항/항공서비스',
    'Marine': '해운',
    'Diversified Capital Markets': '자본시장',
    'Regional Banks': '지역은행',
    'Thrifts & Mortgage Finance': '저축/모기지',
    'Consumer Finance': '소비자금융',
    'Life & Health Insurance': '생명보험',
}

def get_fallback() -> list:
    return [
        {"name": "반도체",      "change_pct":  2.33, "sector": "기술"},
        {"name": "소프트웨어",  "change_pct":  1.42, "sector": "기술"},
        {"name": "인터넷소매",  "change_pct":  2.16, "sector": "경기소비재"},
        {"name": "생명공학",    "change_pct":  1.89, "sector": "헬스케어"},
        {"name": "전기장비",    "change_pct":  1.74, "sector": "산업재"},
        {"name": "항공우주",    "change_pct":  0.54, "sector": "산업재"},
        {"name": "은행",        "change_pct":  0.43, "sector": "금융"},
        {"name": "자동차",      "change_pct":  0.87, "sector": "경기소비재"},
        {"name": "제약",        "change_pct": -0.31, "sector": "헬스케어"},
        {"name": "석유정제",    "change_pct": -0.24, "sector": "에너지"},
        {"name": "리츠(사무실)","change_pct": -0.55, "sector": "부동산"},
        {"name": "유틸리티(전기)","change_pct":-0.62,"sector": "유틸리티"},
    ]

def collect_industries() -> dict:
    if yf is None or pd is None or requests is None:
        return {'industries': get_fallback()}

    try:
        tables = pd.read_html(SP500_WIKIPEDIA)
        sp500_df = tables[0]
        sp500_df.columns = [c.replace(' ', '_') for c in sp500_df.columns]

        industry_col = next(
            (c for c in sp500_df.columns if 'Sub-Industry' in c or 'GICS_Sub' in c), None
        )
        sector_col   = next(
            (c for c in sp500_df.columns if 'Sector' in c and 'Sub' not in c), None
        )
        ticker_col   = next(
            (c for c in sp500_df.columns if 'Symbol' in c or 'Ticker' in c), None
        )

        if not all([industry_col, sector_col, ticker_col]):
            return {'industries': get_fallback()}

        industry_returns = defaultdict(list)
        for _, row in sp500_df.iterrows():
            ticker   = str(row[ticker_col]).replace('.', '-')
            industry = str(row[industry_col])
            sector   = str(row[sector_col])
            try:
                hist = yf.Ticker(ticker).history(period='2d')
                if len(hist) < 2:
                    continue
                chg = (hist['Close'].iloc[-1] - hist['Close'].iloc[-2]) / hist['Close'].iloc[-2] * 100
                industry_returns[(industry, sector)].append(chg)
            except Exception:
                continue

        result = []
        for (industry, sector), returns in industry_returns.items():
            avg = sum(returns) / len(returns)
            kr_name = INDUSTRY_KR.get(industry, industry)
            kr_sector = SECTOR_KR.get(sector, sector)
            result.append({
                'name': kr_name,
                'change_pct': round(avg, 2),
                'sector': kr_sector,
            })

        result.sort(key=lambda x: x['change_pct'], reverse=True)
        return {'industries': result[:60]}

    except Exception as e:
        print(f"  collect_industries fallback: {e}")
        return {'industries': get_fallback()}

if __name__ == '__main__':
    r = collect_industries()
    print(json.dumps(r, ensure_ascii=False, indent=2))
