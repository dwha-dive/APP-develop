import { useState } from 'react'
import MarketHeader from '../components/MarketHeader'
import IndexDropdown, { type MarketIndex } from '../components/IndexDropdown'
import ViewToggle, { type ViewMode } from '../components/ViewToggle'
import FinvizHeatmap from '../components/FinvizHeatmap'
import KoreanHeatmap from '../components/KoreanHeatmap'
import SectorView from '../components/SectorView'
import IndustryView from '../components/IndustryView'
import { getSectors, type MarketData } from '../hooks/useMarketData'

type Period = '1일' | '5일' | '1개월' | '3개월' | '1년'

const US_INDICES: MarketIndex[] = ['sp500', 'nasdaq100', 'dow30']
const PERIODS: Period[] = ['1일', '5일', '1개월', '3개월', '1년']

interface Props { data: MarketData }

export default function MarketTab({ data }: Props) {
  const [index, setIndex] = useState<MarketIndex>('sp500')
  const [period, setPeriod] = useState<Period>('1일')
  const [view, setView] = useState<ViewMode>('map')

  const isUS = US_INDICES.includes(index)
  const sectors = getSectors(data)
  const industries = data.industries ?? []

  const krStocks =
    index === 'kospi200'
      ? (data.heatmap?.kospi200 ?? data.heatmap?.kospi ?? [])
      : (data.heatmap?.kosdaq150 ?? [])

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
        isUS
          ? <FinvizHeatmap index={index} period={period} />
          : <KoreanHeatmap
              stocks={krStocks}
              label={index === 'kospi200' ? '코스피 200' : '코스닥 150'}
            />
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
