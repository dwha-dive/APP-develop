import MetricCard from '../components/MetricCard'
import ThermometerBar from '../components/ThermometerBar'
import StatusBadge from '../components/StatusBadge'
import { getUpdatedAt, type MarketData } from '../hooks/useMarketData'

interface Props { data: MarketData }

export default function HomeTab({ data }: Props) {
  const { composite } = data.temperature
  const k = data.kr_market
  const u = data.us_market

  return (
    <div className="p-4 space-y-4">
      {/* 온도 요약 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">시장 온도</span>
          <StatusBadge status={composite.status} />
        </div>
        <div className="text-4xl font-black text-orange-500 mb-1">
          {composite.score.toFixed(1)}
          <span className="text-lg text-gray-400 font-normal">/100</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{composite.description}</p>
        <ThermometerBar score={composite.score} />
      </div>

      {/* 한국 증시 */}
      <div>
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-2">한국 증시</div>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="KOSPI"    value={k.kospi.value.toLocaleString()}    change={k.kospi.change} />
          <MetricCard label="KOSDAQ"   value={k.kosdaq.value.toLocaleString()}   change={k.kosdaq.change} />
        </div>
      </div>

      {/* 미국 증시 */}
      <div>
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-2">미국 증시</div>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="S&P 500" value={u.sp500.value.toLocaleString()}  change={u.sp500.change} />
          <MetricCard label="NASDAQ"  value={u.nasdaq.value.toLocaleString()}  change={u.nasdaq.change} />
          <MetricCard label="DOW"     value={u.dow.value.toLocaleString()}     change={u.dow.change} />
          <MetricCard label="Russell" value={u.russell.value.toLocaleString()} change={u.russell.change} />
        </div>
      </div>

      {/* 환율/금리 */}
      <div>
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-2">주요 지표</div>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="달러/원"    value={data.macro.usd_krw.value.toLocaleString()} unit="₩" />
          <MetricCard label="미 10년물"  value={data.macro.us_10y.value.toFixed(2)} unit="%" />
          <MetricCard label="WTI"        value={data.macro.wti.value.toFixed(2)} unit="$" />
          <MetricCard label="금"         value={data.macro.gold.value.toLocaleString()} unit="$" />
        </div>
      </div>

      <div className="text-xs text-center text-gray-400">
        업데이트: {getUpdatedAt(data.updated_at)} KST
      </div>
    </div>
  )
}
