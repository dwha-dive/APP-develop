import SupplyChart from '../components/SupplyChart'
import { formatLargeNum, changeColor } from '../utils/scoreCalc'
import type { MarketData } from '../hooks/useMarketData'

interface Props { data: MarketData }

function FlowRow({ label, value }: { label: string; value: number }) {
  const isPos = value >= 0
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <span className={`text-sm font-semibold ${isPos ? 'text-blue-500' : 'text-red-500'}`}>
        {formatLargeNum(value)}
      </span>
    </div>
  )
}

function TopTable({ title, rows }: {
  title: string
  rows: Array<{ name: string; net: number; change: number }>
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</div>
      <div className="space-y-1">
        {rows.slice(0, 10).map((r, i) => (
          <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4">{i + 1}</span>
              <span className="text-sm text-gray-800 dark:text-gray-200">{r.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-500">{formatLargeNum(r.net)}</div>
              <div className={`text-xs ${changeColor(r.change)}`}>
                {r.change > 0 ? '+' : ''}{r.change.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SupplyTab({ data }: Props) {
  const sd = data.supply_demand
  const dateStr = `${sd.date.slice(0, 4)}.${sd.date.slice(4, 6)}.${sd.date.slice(6, 8)}`

  return (
    <div className="p-4 space-y-3">
      {/* 시장 전체 수급 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">시장 전체 수급</div>
          <div className="text-xs text-gray-400">{dateStr} 마감</div>
        </div>
        <FlowRow label="외국인 KOSPI"  value={sd.kospi_foreign} />
        <FlowRow label="기관 KOSPI"    value={sd.kospi_institution} />
        <FlowRow label="외국인 KOSDAQ" value={sd.kosdaq_foreign} />
        <FlowRow label="연기금"        value={sd.pension} />
        <FlowRow label="개인"          value={sd.individual} />
      </div>

      {/* 차트 */}
      <SupplyChart data={sd.foreign_daily} />

      {/* 외국인 Top 10 */}
      <TopTable title="외국인 순매수 Top 10 (KOSPI)" rows={sd.top_buy_foreign} />

      {/* 기관 Top 10 */}
      <TopTable title="기관 순매수 Top 10 (KOSPI)" rows={sd.top_buy_institution} />

      {/* 외국인 지분율 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">주요 종목 외국인 지분율</div>
        {sd.foreign_holdings.map((h, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
            <span className="text-sm text-gray-800 dark:text-gray-200">{h.name}</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{h.ratio.toFixed(1)}%</span>
              <span className={`text-xs ml-2 ${h.change > 0 ? 'text-red-500' : h.change < 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                {h.change > 0 ? '+' : ''}{h.change.toFixed(1)}%p
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
