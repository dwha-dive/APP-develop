export interface EconomicEvent {
  date: string
  time?: string
  event: string
  importance: 'high' | 'medium' | 'low'
  expected?: string | null
  previous?: string | null
  actual?: string | null
  country?: string
}

interface Props { events: EconomicEvent[] }

function ImportanceBadge({ level }: { level: EconomicEvent['importance'] }) {
  const map = {
    high:   { dot: '🔴', label: '고위험', cls: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    medium: { dot: '🟡', label: '주목',   cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
    low:    { dot: '🟢', label: '참고',   cls: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  }
  const { dot, label, cls } = map[level]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {dot} {label}
    </span>
  )
}

export default function EconomicCalendar({ events }: Props) {
  const grouped = events.reduce<Record<string, EconomicEvent[]>>((acc, e) => {
    ;(acc[e.date] ??= []).push(e)
    return acc
  }, {})

  return (
    <div className="p-3 space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 px-1 mb-2">
            {date}
          </div>
          <div className="space-y-2">
            {items.map((ev, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs text-gray-400 shrink-0">{ev.time ?? ''}</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{ev.event}</span>
                  </div>
                  <ImportanceBadge level={ev.importance} />
                </div>
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {ev.expected != null && <span>예상 <span className="font-medium text-gray-700 dark:text-gray-300">{ev.expected}</span></span>}
                  {ev.previous != null && <span>이전 {ev.previous}</span>}
                  {ev.actual != null && (
                    <span className={`font-semibold ${
                      ev.expected && parseFloat(ev.actual) > parseFloat(ev.expected) ? 'text-green-600' : 'text-red-500'
                    }`}>
                      실제 {ev.actual}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <div className="text-center text-gray-400 py-12 text-sm">이번 주 일정이 없습니다</div>
      )}
    </div>
  )
}
