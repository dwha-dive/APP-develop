export interface EarningsItem {
  date: string
  ticker: string
  company: string
  timing: 'BMO' | 'AMC' | 'unknown'
  eps_estimate: number | null
  eps_actual: number | null
  surprise_pct: number | null
}

interface Props { earnings: EarningsItem[] }

const TIMING_ICON: Record<string, string> = {
  BMO: '🌅',
  AMC: '🌆',
  unknown: '❓',
}

export default function EarningsCalendar({ earnings }: Props) {
  const grouped = earnings.reduce<Record<string, EarningsItem[]>>((acc, e) => {
    ;(acc[e.date] ??= []).push(e)
    return acc
  }, {})

  return (
    <div className="p-3 space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400 px-1 mb-2">{date}</div>
          <div className="space-y-2">
            {items.map((e, i) => {
              const hasResult = e.eps_actual !== null
              const beat = hasResult && e.eps_estimate !== null && e.eps_actual! > e.eps_estimate
              return (
                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{TIMING_ICON[e.timing]}</span>
                      <div>
                        <div className="text-sm font-bold text-gray-800 dark:text-gray-100">{e.company}</div>
                        <div className="text-xs text-gray-400">{e.ticker}</div>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      {!hasResult ? (
                        <>
                          {e.eps_estimate !== null && (
                            <div className="text-gray-500 dark:text-gray-400">
                              EPS 예상 <span className="font-medium text-gray-700 dark:text-gray-300">${e.eps_estimate}</span>
                            </div>
                          )}
                          <div className="text-gray-400">결과 대기중</div>
                        </>
                      ) : (
                        <>
                          <div className={`font-bold text-sm ${beat ? 'text-green-600' : 'text-red-500'}`}>
                            {beat ? '✅' : '❌'} EPS ${e.eps_actual}
                          </div>
                          {e.surprise_pct !== null && (
                            <div className={`font-medium ${beat ? 'text-green-600' : 'text-red-500'}`}>
                              {e.surprise_pct > 0 ? '+' : ''}{e.surprise_pct.toFixed(1)}% 서프라이즈
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      {earnings.length === 0 && (
        <div className="text-center text-gray-400 py-12 text-sm">이번 주 실적발표가 없습니다</div>
      )}
    </div>
  )
}
