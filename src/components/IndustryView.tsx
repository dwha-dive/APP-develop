import type { IndustryItem } from '../hooks/useMarketData'

interface Props { industries: IndustryItem[] }

export default function IndustryView({ industries }: Props) {
  const sorted = [...industries].sort((a, b) => b.change_pct - a.change_pct)
  const maxAbs = Math.max(...sorted.map(i => Math.abs(i.change_pct)), 0.01)

  return (
    <div className="px-3 py-2 space-y-0.5">
      {sorted.map(item => {
        const isUp = item.change_pct >= 0
        const barWidth = (Math.abs(item.change_pct) / maxAbs) * 100
        return (
          <div key={item.name} className="flex items-center gap-2 py-1">
            <span className="text-xs text-gray-700 dark:text-gray-200 w-28 shrink-0 truncate">{item.name}</span>
            <div className="flex-1 h-3.5 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
              <div
                className="h-full rounded transition-all"
                style={{ width: `${barWidth}%`, backgroundColor: isUp ? '#b91c1c' : '#1e3a5f' }}
              />
            </div>
            <span className={`text-xs font-medium w-14 text-right shrink-0 ${isUp ? 'text-red-500' : 'text-blue-500'}`}>
              {isUp ? '+' : ''}{item.change_pct.toFixed(2)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
