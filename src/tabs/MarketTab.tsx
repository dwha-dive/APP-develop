import { useState } from 'react'
import MarketHeader from '../components/MarketHeader'
import IndexDropdown, { type MarketIndex } from '../components/IndexDropdown'
import ViewToggle, { type ViewMode } from '../components/ViewToggle'
import KoreanHeatmap from '../components/KoreanHeatmap'
import SectorView from '../components/SectorView'
import IndustryView from '../components/IndustryView'
import { type MarketData, type HeatmapStock, type SectorItem } from '../hooks/useMarketData'

type Period = '1일' | '5일' | '1개월' | '3개월' | '1년'

const US_INDICES: MarketIndex[] = ['sp500', 'nasdaq100', 'dow30']
const PERIODS: Period[] = ['1일', '5일', '1개월', '3개월', '1년']

const SECTOR_EMOJIS: Record<string, string> = {
  '기술': '🔧', 'IT': '🔧', 'Technology': '🔧', 'Information Technology': '🔧',
  '금융': '💰', 'Financial Services': '💰', 'Financials': '💰',
  '헬스케어': '💊', 'Healthcare': '💊', 'Health Care': '💊',
  '경기소비재': '🛍️', 'Consumer Cyclical': '🛍️', 'Consumer Discretionary': '🛍️',
  '필수소비재': '🧴', 'Consumer Staples': '🧴', 'Consumer Defensive': '🧴',
  '에너지': '🛢️', 'Energy': '🛢️',
  '산업재': '🏭', 'Industrials': '🏭',
  '소재': '⚗️', 'Materials': '⚗️', 'Basic Materials': '⚗️',
  '부동산': '🏢', 'Real Estate': '🏢',
  '통신서비스': '📡', 'Communication Services': '📡', 'Communication': '📡',
  '유틸리티': '⚡', 'Utilities': '⚡',
  '기타': '📦',
}

function computeSectors(stocks: HeatmapStock[]): SectorItem[] {
  const map = new Map<string, { totalChange: number; count: number }>()
  for (const s of stocks) {
    const sec = s.sector ?? '기타'
    if (!map.has(sec)) map.set(sec, { totalChange: 0, count: 0 })
    const entry = map.get(sec)!
    entry.totalChange += s.change_pct
    entry.count++
  }
  return Array.from(map.entries())
    .map(([name, { totalChange, count }]) => ({
      name,
      emoji: SECTOR_EMOJIS[name],
      etf: '',
      change_pct: Math.round(totalChange / count * 100) / 100,
    }))
    .sort((a, b) => b.change_pct - a.change_pct)
}

interface Props { data: MarketData }

export default function MarketTab({ data }: Props) {
  const [index, setIndex] = useState<MarketIndex>('sp500')
  const [period, setPeriod] = useState<Period>('1일')
  const [view, setView] = useState<ViewMode>('map')

  const isUS = US_INDICES.includes(index)

  const currentStocks: HeatmapStock[] =
    index === 'sp500'      ? (data.heatmap?.sp500     ?? [])
    : index === 'nasdaq100'  ? (data.heatmap?.nasdaq100 ?? [])
    : index === 'dow30'      ? (data.heatmap?.dow30     ?? [])
    : index === 'kospi200'   ? (data.heatmap?.kospi200  ?? data.heatmap?.kospi ?? [])
    :                          (data.heatmap?.kosdaq150 ?? [])

  const sectors = computeSectors(currentStocks)
  const industries = data.industries ?? []

  const heatmapLabel =
    index === 'sp500'     ? 'S&P 500'
    : index === 'nasdaq100' ? 'NASDAQ 100'
    : index === 'dow30'     ? 'DOW 30'
    : index === 'kospi200'  ? '코스피 200'
    : '코스닥 150'

  return (
    <div>
      <MarketHeader data={data} />

      {/* Controls row */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <IndexDropdown value={index} onChange={v => { setIndex(v); setView('map') }} />
        <div className="ml-auto">
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {/* Period selector — map view only */}
      {view === 'map' && (
        <div className="flex gap-1 px-3 pb-2">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                period === p
                  ? 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {view === 'map' && (
        currentStocks.length > 0
          ? <KoreanHeatmap stocks={currentStocks} label={heatmapLabel} />
          : <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              {isUS ? '미국 히트맵 데이터 로딩 중...' : '한국 히트맵 데이터 로딩 중...'}
            </div>
      )}

      {view === 'sector' && (
        sectors.length > 0
          ? <SectorView sectors={sectors} />
          : <div className="flex items-center justify-center h-40 text-gray-400 text-sm">섹터 데이터 없음</div>
      )}

      {view === 'industry' && (
        industries.length > 0
          ? <IndustryView industries={industries} />
          : <div className="flex items-center justify-center h-40 text-gray-400 text-sm">산업 데이터 없음</div>
      )}
    </div>
  )
}
