import type { FedWatchData } from '../hooks/useMarketData'

interface Props { data: FedWatchData }

function ProbBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-sm text-gray-700 dark:text-gray-300 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 w-12 text-right">{pct.toFixed(1)}%</span>
    </div>
  )
}

function decisionLabel(d: string | null): { text: string; cls: string } {
  if (!d) return { text: '예정', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' }
  if (d === 'hold') return { text: '동결', cls: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' }
  if (d.startsWith('cut')) return { text: `↓${d.replace('cut', '').replace('bp', '')}bp`, cls: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' }
  if (d.startsWith('hike')) return { text: `↑${d.replace('hike', '').replace('bp', '')}bp`, cls: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' }
  return { text: d, cls: 'bg-gray-100 text-gray-600' }
}

export default function FedWatchCard({ data }: Props) {
  const { probabilities: p } = data

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-100">다음 FOMC</div>
            <div className="text-xs text-gray-400">{data.next_fomc} · D-{data.days_until}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">현재 기준금리</div>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              {data.current_rate_low.toFixed(2)} ~ {data.current_rate_high.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400 mb-2">금리 결정 확률 (CME FedWatch)</div>
        {p.cut_50bp > 0 && <ProbBar label="인하 -50bp" pct={p.cut_50bp} color="bg-green-600" />}
        <ProbBar label="인하 -25bp" pct={p.cut_25bp} color="bg-green-400" />
        <ProbBar label="동결" pct={p.hold} color="bg-gray-400" />
        {p.hike_25bp > 0 && <ProbBar label="인상 +25bp" pct={p.hike_25bp} color="bg-red-400" />}
      </div>

      {/* FOMC timeline */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">2026 FOMC 일정</div>
        <div className="grid grid-cols-4 gap-2">
          {data.fomc_schedule.map((item, i) => {
            const month = item.date.slice(5, 7) + '월'
            const { text, cls } = decisionLabel(item.decision)
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">{month}</div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium text-center ${cls}`}>{text}</span>
                {item.rate !== null && (
                  <div className="text-xs text-gray-400">{item.rate.toFixed(2)}%</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
