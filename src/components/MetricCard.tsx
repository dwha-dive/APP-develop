import { changeArrow, changeColor } from '../utils/scoreCalc'

interface Props {
  label: string
  value: string
  change?: number
  unit?: string
  sub?: string
}

export default function MetricCard({ label, value, change, unit, sub }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-gray-900 dark:text-white">{value}</span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
      {change !== undefined && (
        <div className={`text-sm font-medium mt-0.5 ${changeColor(change)}`}>
          {changeArrow(change)} {Math.abs(change).toFixed(2)}%
        </div>
      )}
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}
