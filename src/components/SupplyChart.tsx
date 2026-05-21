interface Bar { date: string; net: number }

interface Props {
  data: Bar[]
}

export default function SupplyChart({ data }: Props) {
  const maxAbs = Math.max(...data.map(d => Math.abs(d.net)))

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        외국인 일별 순매수 (최근 15거래일)
      </div>
      <div className="flex items-end gap-1 h-24">
        {data.map((d, i) => {
          const pct = maxAbs > 0 ? (Math.abs(d.net) / maxAbs) * 100 : 0
          const isPos = d.net >= 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className={`w-full rounded-sm ${isPos ? 'bg-blue-400' : 'bg-red-400'}`}
                style={{ height: `${pct}%` }}
                title={`${d.date}: ${d.net > 0 ? '+' : ''}${(d.net / 100_000_000).toFixed(0)}억`}
              />
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{data[0]?.date.slice(4)}</span>
        <span className="text-blue-400">■ 순매수</span>
        <span className="text-red-400">■ 순매도</span>
        <span>{data[data.length - 1]?.date.slice(4)}</span>
      </div>
    </div>
  )
}
