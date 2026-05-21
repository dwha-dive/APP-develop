import { useState } from 'react'
import EconomicCalendar from '../components/EconomicCalendar'
import EarningsCalendar from '../components/EarningsCalendar'
import FedWatchCard from '../components/FedWatchCard'
import type { MarketData } from '../hooks/useMarketData'

type Sub = 'economic' | 'earnings' | 'fedwatch'

interface Props { data: MarketData }

export default function CalendarTab({ data }: Props) {
  const [sub, setSub] = useState<Sub>('economic')
  const cal = data.calendar

  return (
    <div>
      {/* Sub tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
        {([
          ['economic', '경제지표'],
          ['earnings', '어닝'],
          ['fedwatch', 'Fed Watch'],
        ] as [Sub, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              sub === id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === 'economic' && (
        <EconomicCalendar events={cal?.economic ?? []} />
      )}
      {sub === 'earnings' && (
        <EarningsCalendar earnings={cal?.earnings ?? []} />
      )}
      {sub === 'fedwatch' && cal?.fed_watch && (
        <FedWatchCard data={cal.fed_watch} />
      )}
      {sub === 'fedwatch' && !cal?.fed_watch && (
        <div className="text-center text-gray-400 py-12 text-sm">Fed Watch 데이터 없음</div>
      )}
    </div>
  )
}
