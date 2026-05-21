import { useState } from 'react'
import HeatmapView from '../components/HeatmapView'
import SectorView from '../components/SectorView'
import type { MarketData } from '../hooks/useMarketData'

type Market = 'sp500' | 'nasdaq100' | 'kospi'
type View = 'heatmap' | 'sector'

interface Props { data: MarketData }

const MARKET_LABELS: Record<Market, string> = {
  sp500:    'S&P 500',
  nasdaq100: '나스닥',
  kospi:    '코스피',
}

export default function MarketTab({ data }: Props) {
  const [market, setMarket] = useState<Market>('sp500')
  const [view, setView] = useState<View>('heatmap')

  const heatmapItems = data.heatmap?.[market] ?? []
  const sectors = data.sectors ?? []

  return (
    <div>
      {/* Market toggle */}
      <div className="flex gap-2 px-4 pt-3 pb-2">
        {(Object.keys(MARKET_LABELS) as Market[]).map(m => (
          <button
            key={m}
            onClick={() => setMarket(m)}
            className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-colors ${
              market === m
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {MARKET_LABELS[m]}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-2 px-4 pb-3">
        <button
          onClick={() => setView('heatmap')}
          className={`px-4 py-1 rounded-full text-sm font-medium border transition-colors ${
            view === 'heatmap'
              ? 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setView('sector')}
          className={`px-4 py-1 rounded-full text-sm font-medium border transition-colors ${
            view === 'sector'
              ? 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
          }`}
        >
          섹터별
        </button>
      </div>

      {/* Content */}
      {view === 'heatmap' ? (
        heatmapItems.length > 0
          ? <HeatmapView items={heatmapItems} />
          : <div className="flex items-center justify-center h-40 text-gray-400 text-sm">히트맵 데이터 없음</div>
      ) : (
        sectors.length > 0
          ? <SectorView sectors={sectors} />
          : <div className="flex items-center justify-center h-40 text-gray-400 text-sm">섹터 데이터 없음</div>
      )}
    </div>
  )
}
