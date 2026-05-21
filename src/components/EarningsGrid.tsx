import { useState } from 'react'
import type { EarningsItem, EarningsWeek } from '../hooks/useMarketData'
import EarningsDetailModal from './EarningsDetailModal'

const WEEKDAYS = ['월', '화', '수', '목', '금']

type WeekKey = 'prev_week' | 'curr_week' | 'next_week'
type TierFilter = 'all' | 'small' | 'mid' | 'large'

interface Props {
  prev_week?: EarningsWeek
  curr_week?: EarningsWeek
  next_week?: EarningsWeek
}

function EarningsCell({ item, onClick }: { item: EarningsItem; onClick: () => void }) {
  const hasSurprise = item.eps_actual != null && item.eps_estimate != null
  const beat = hasSurprise && (item.surprise_pct ?? 0) > 0
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 mb-1 active:scale-95 transition-transform"
    >
      <div className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{item.ticker}</div>
      <div className="text-[10px] text-gray-500 dark:text-gray-400">{item.time_str}</div>
      {hasSurprise && (
        <div className={`text-[10px] font-semibold ${beat ? 'text-red-500' : 'text-blue-500'}`}>
          {beat ? '↑' : '↓'}{Math.abs(item.surprise_pct!).toFixed(1)}%
        </div>
      )}
    </button>
  )
}

function getWeekDates(mondayStr: string): string[] {
  const base = new Date(mondayStr)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export default function EarningsGrid({ prev_week, curr_week, next_week }: Props) {
  const [weekKey, setWeekKey] = useState<WeekKey>('curr_week')
  const [tier, setTier] = useState<TierFilter>('all')
  const [selected, setSelected] = useState<EarningsItem | null>(null)

  const weeks: Record<WeekKey, EarningsWeek | undefined> = { prev_week, curr_week, next_week }
  const activeWeek = weeks[weekKey]
  const items = (activeWeek?.items ?? []).filter(
    i => tier === 'all' || i.market_cap_tier === tier
  )

  const byDate = new Map<string, { bmo: EarningsItem[]; amc: EarningsItem[] }>()
  for (const item of items) {
    if (!byDate.has(item.date)) byDate.set(item.date, { bmo: [], amc: [] })
    const slot = byDate.get(item.date)!
    if (item.timing === 'BMO') slot.bmo.push(item)
    else slot.amc.push(item)
  }

  const weekDates = activeWeek ? getWeekDates(activeWeek.range.start) : []

  const hasAny = weekDates.some(d => {
    const s = byDate.get(d)
    return s && (s.bmo.length > 0 || s.amc.length > 0)
  })

  return (
    <div>
      {/* Week selector */}
      <div className="flex gap-2 px-3 pt-3 pb-2">
        {([['prev_week', '저번 주'], ['curr_week', '이번 주'], ['next_week', '다음 주']] as [WeekKey, string][]).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setWeekKey(key)}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${
                weekKey === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* Tier filter */}
      <div className="flex gap-1.5 px-3 pb-2">
        {([['all', '전체'], ['small', '소형주'], ['mid', '중형주'], ['large', '대형주']] as [TierFilter, string][]).map(
          ([t, label]) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                tier === t
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      {activeWeek && (
        <div className="text-xs text-gray-400 px-3 pb-1">
          {activeWeek.range.start} ~ {activeWeek.range.end}
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[560px] px-2">
          {/* Header */}
          <div className="grid grid-cols-10 gap-0.5 mb-1">
            {weekDates.map((date, i) => (
              <div key={date} className="col-span-2 text-center">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{WEEKDAYS[i]}</div>
                <div className="text-[10px] text-gray-400">{date.slice(5)}</div>
                <div className="grid grid-cols-2 gap-0.5 mt-1">
                  <div className="text-[9px] text-gray-400 text-center bg-blue-50 dark:bg-blue-950 rounded py-0.5">장전</div>
                  <div className="text-[9px] text-gray-400 text-center bg-orange-50 dark:bg-orange-950 rounded py-0.5">장후</div>
                </div>
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-10 gap-0.5">
            {weekDates.map(date => {
              const slot = byDate.get(date) ?? { bmo: [], amc: [] }
              return (
                <div key={date} className="col-span-2 grid grid-cols-2 gap-0.5">
                  <div>
                    {slot.bmo.map(item => (
                      <EarningsCell key={item.ticker} item={item} onClick={() => setSelected(item)} />
                    ))}
                  </div>
                  <div>
                    {slot.amc.map(item => (
                      <EarningsCell key={item.ticker} item={item} onClick={() => setSelected(item)} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {!hasAny && (
            <div className="text-center text-gray-400 py-8 text-sm">실적 데이터 없음</div>
          )}
        </div>
      </div>

      {selected && <EarningsDetailModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
