import { useState } from 'react'

export interface SectorData {
  name: string
  etf: string
  change_pct: number
  stocks: Array<{ ticker: string; change_pct: number }>
}

interface Props {
  sectors: SectorData[]
}

type Filter = 'all' | 'up' | 'down'

function StockChip({ ticker, change }: { ticker: string; change: number }) {
  const isUp = change >= 0
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${isUp ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
      {ticker} {change > 0 ? '+' : ''}{change.toFixed(1)}%
    </span>
  )
}

export default function SectorView({ sectors }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const sorted = [...sectors].sort((a, b) => b.change_pct - a.change_pct)
  const filtered = sorted.filter(s =>
    filter === 'all' ? true : filter === 'up' ? s.change_pct >= 0 : s.change_pct < 0
  )

  return (
    <div className="p-3 space-y-2">
      {/* Filter */}
      <div className="flex gap-2 mb-3">
        {(['all', 'up', 'down'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {f === 'all' ? '전체' : f === 'up' ? '▲ 상승' : '▼ 하락'}
          </button>
        ))}
      </div>

      {filtered.map(sector => {
        const isUp = sector.change_pct >= 0
        const barPct = Math.min(100, Math.abs(sector.change_pct) * 15)

        return (
          <div key={sector.name} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{sector.name}</span>
                <span className="text-xs text-gray-400 ml-1.5">{sector.etf}</span>
              </div>
              <span className={`text-sm font-bold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                {isUp ? '+' : ''}{sector.change_pct.toFixed(2)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mb-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isUp ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${barPct}%` }}
              />
            </div>

            {/* Stocks */}
            <div className="flex flex-wrap gap-1.5">
              {sector.stocks.map(s => (
                <StockChip key={s.ticker} ticker={s.ticker} change={s.change_pct} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
