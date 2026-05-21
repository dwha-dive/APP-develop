import type { MarketData } from '../hooks/useMarketData'

interface Props { data: MarketData }

function ImportanceDot({ level }: { level: 'high' | 'medium' | 'low' }) {
  const colors = { high: '🔴', medium: '🟡', low: '🟢' }
  return <span>{colors[level]}</span>
}

export default function CalendarTab({ data }: Props) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="p-4 space-y-3">
      {/* 경제 일정 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">주요 경제 일정</div>
        <div className="space-y-2">
          {data.calendar.map((item, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border ${
                item.date === today
                  ? 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <ImportanceDot level={item.importance} />
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.event}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.date}</div>
                  </div>
                </div>
                {(item.expected || item.previous) && (
                  <div className="text-right text-xs text-gray-500 dark:text-gray-400 shrink-0">
                    {item.expected && <div>예상: <span className="font-medium">{item.expected}</span></div>}
                    {item.previous && <div>이전: {item.previous}</div>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 실적발표 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">실적 발표 트래커</div>
        <div className="space-y-2">
          {data.earnings.map((e, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
              <div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{e.name}</div>
                <div className="text-xs text-gray-400">{e.date}</div>
              </div>
              <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                <div>EPS 예상: <span className="font-medium">{e.eps_expected}</span></div>
                {e.eps_actual !== null
                  ? <div className={e.surprise_pct! > 0 ? 'text-red-500' : 'text-blue-500'}>
                      실제: {e.eps_actual} ({e.surprise_pct! > 0 ? '+' : ''}{e.surprise_pct?.toFixed(1)}%)
                    </div>
                  : <div className="text-gray-400">결과 대기중</div>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
