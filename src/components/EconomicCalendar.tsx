import { useState } from 'react'
import CountdownTimer from './CountdownTimer'
import type { EconomicEvent } from '../hooks/useMarketData'

type DateTab = 'yesterday' | 'today' | 'tomorrow' | 'this_week' | 'next_week'

interface Props {
  economic_calendar?: {
    yesterday?: EconomicEvent[]
    today?: EconomicEvent[]
    tomorrow?: EconomicEvent[]
    this_week?: EconomicEvent[]
    next_week?: EconomicEvent[]
  }
  events?: EconomicEvent[]
}

const IMP_STARS: Record<number, string> = { 1: '★☆☆', 2: '★★☆', 3: '★★★' }
const IMP_COLOR: Record<number, string> = { 1: 'text-gray-400', 2: 'text-yellow-500', 3: 'text-red-500' }

const DATE_TABS: Array<[DateTab, string]> = [
  ['yesterday', '어제'],
  ['today', '오늘'],
  ['tomorrow', '내일'],
  ['this_week', '이번 주'],
  ['next_week', '다음 주'],
]

function EventRow({ event, showCountdown }: { event: EconomicEvent; showCountdown: boolean }) {
  const time = event.time_kst ?? event.time ?? ''
  const flag = event.flag ?? (event.country === 'US' ? '🇺🇸' : event.country === 'KR' ? '🇰🇷' : '')
  const actual = event.actual
  const forecast = event.forecast
  const hasActual = actual != null && actual !== ''
  const hasForecast = forecast != null && forecast !== ''

  let actualCls = 'text-gray-700 dark:text-gray-200'
  if (hasActual && hasForecast) {
    const a = parseFloat(actual!)
    const f = parseFloat(forecast!)
    if (!isNaN(a) && !isNaN(f)) {
      actualCls = a > f ? 'text-red-500 font-semibold' : a < f ? 'text-blue-500 font-semibold' : actualCls
    }
  }

  return (
    <>
      {showCountdown && event.next_release_datetime && (
        <CountdownTimer targetDatetime={event.next_release_datetime} />
      )}
      <div className="flex gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
        <div className="text-xs text-gray-500 w-10 shrink-0 pt-0.5 font-mono">{time}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-xs ${IMP_COLOR[event.importance]}`}>{IMP_STARS[event.importance]}</span>
            <span className="text-xs">{flag}</span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{event.name}</span>
          </div>
          <div className="flex gap-2 text-xs text-gray-500">
            <span>실제: <span className={actualCls}>{hasActual ? actual : '-'}</span></span>
            <span>예상: {hasForecast ? forecast : '-'}</span>
            <span>이전: {event.previous || '-'}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function EconomicCalendar({ economic_calendar, events }: Props) {
  const [dateTab, setDateTab] = useState<DateTab>('today')
  const [minImp, setMinImp] = useState<1 | 2 | 3>(1)

  let allEvents: EconomicEvent[] = []
  if (economic_calendar) {
    allEvents = economic_calendar[dateTab] ?? []
  } else if (events) {
    allEvents = events
  }

  const filtered = allEvents.filter(e => (e.importance ?? 1) >= minImp)

  return (
    <div>
      {economic_calendar && (
        <div className="flex overflow-x-auto gap-1 px-3 pt-3 pb-2" style={{ scrollbarWidth: 'none' }}>
          {DATE_TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDateTab(key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                dateTab === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 px-3 pb-2">
        {([3, 2, 1] as const).map(imp => (
          <button
            key={imp}
            onClick={() => setMinImp(imp)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              minImp === imp
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className={IMP_COLOR[imp]}>{IMP_STARS[imp]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-8 text-sm">경제지표 데이터 없음</div>
      ) : (
        <div>
          {filtered.map((event, i) => (
            <EventRow
              key={event.event_id ?? i}
              event={event}
              showCountdown={!!event.is_next_release}
            />
          ))}
        </div>
      )}
    </div>
  )
}
