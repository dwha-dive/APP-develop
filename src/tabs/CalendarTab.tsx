import { useState } from 'react'
import EconomicCalendar from '../components/EconomicCalendar'
import EarningsGrid from '../components/EarningsGrid'
import FedWatchCard from '../components/FedWatchCard'
import type { MarketData } from '../hooks/useMarketData'

type Sub = 'economic' | 'earnings' | 'fedwatch'

interface Props { data: MarketData }

export default function CalendarTab({ data }: Props) {
  const [sub, setSub] = useState<Sub>('economic')
  const fedWatch = data.fed_watch ?? data.calendar?.fed_watch

  return (
    <div>
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
        {([
          ['economic', '경제지표'],
          ['earnings', '실적발표'],
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
        <EconomicCalendar
          economic_calendar={data.economic_calendar}
          events={data.calendar?.economic}
        />
      )}

      {sub === 'earnings' && (
        <EarningsGrid
          prev_week={data.earnings?.prev_week}
          curr_week={data.earnings?.curr_week}
          next_week={data.earnings?.next_week}
        />
      )}

      {sub === 'fedwatch' && fedWatch ? (
        <FedWatchCard data={fedWatch} />
      ) : sub === 'fedwatch' ? (
        <div className="text-center text-gray-400 py-12 text-sm">Fed Watch 데이터 없음</div>
      ) : null}
    </div>
  )
}
