import { useState, useEffect, useRef } from 'react'
import { useMarketData, getUpdatedAt } from './hooks/useMarketData'
import BottomTabBar, { type TabId } from './components/BottomTabBar'
import TemperatureTab from './tabs/TemperatureTab'
import MarketTab from './tabs/MarketTab'
import SupplyTab from './tabs/SupplyTab'
import CalendarTab from './tabs/CalendarTab'
import HomeTab from './tabs/HomeTab'
import './index.css'

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
  const [tab, setTab] = useState<TabId>('home')
  const [dark, setDark] = useDarkMode()
  const { data, loading, error } = useMarketData()
  const mainRef = useRef<HTMLElement>(null)

  function handleTabChange(id: TabId) {
    setTab(id)
    mainRef.current?.scrollTo({ top: 0 })
  }

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header — safe area top padding */}
      <header
        className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">📊 시장 온도계</h1>
            {data && (
              <p className="text-xs text-gray-400">
                업데이트: {getUpdatedAt(data.updated_at)}
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
      </header>

      {/* Content — bottom padding accounts for tab bar + safe area */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'calc(56px + env(safe-area-inset-bottom) + 8px)' }}
      >
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
            {tab === 'home'        && <HomeTab data={data} />}
            {tab === 'temperature' && <TemperatureTab data={data} />}
            {tab === 'market'      && <MarketTab data={data} />}
            {tab === 'supply'      && <SupplyTab data={data} />}
            {tab === 'calendar'    && <CalendarTab data={data} />}
          </>
        )}
      </main>

      {/* Bottom tab bar */}
      <BottomTabBar active={tab} onChange={handleTabChange} />
    </div>
  )
}
