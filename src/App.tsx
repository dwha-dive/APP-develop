import { useState, useEffect } from 'react'
import { useMarketData } from './hooks/useMarketData'
import TemperatureTab from './tabs/TemperatureTab'
import DashboardTab from './tabs/DashboardTab'
import SupplyTab from './tabs/SupplyTab'
import CalendarTab from './tabs/CalendarTab'
import './index.css'

const TABS = [
  { id: 'temperature', label: '시장 온도계' },
  { id: 'dashboard',   label: '대시보드' },
  { id: 'supply',      label: '수급' },
  { id: 'calendar',    label: '일정' },
] as const

type TabId = (typeof TABS)[number]['id']

function useDarkMode() {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  return [dark, setDark] as const
}

export default function App() {
  const [tab, setTab] = useState<TabId>('temperature')
  const [dark, setDark] = useDarkMode()
  const { data, loading, error } = useMarketData()

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">📊 시장 온도계</h1>
            {data && (
              <p className="text-xs text-gray-400">
                업데이트: {data.updated_at.slice(0, 16).replace('T', ' ')}
              </p>
            )}
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg"
            aria-label="다크모드 토글"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto -mx-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-6">
        {loading && (
          <div className="flex items-center justify-center h-40 text-gray-400">
            불러오는 중...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-40 text-red-400">
            {error}
          </div>
        )}
        {data && (
          <>
            {tab === 'temperature' && <TemperatureTab data={data} />}
            {tab === 'dashboard'   && <DashboardTab data={data} />}
            {tab === 'supply'      && <SupplyTab data={data} />}
            {tab === 'calendar'    && <CalendarTab data={data} />}
          </>
        )}
      </main>
    </div>
  )
}
