import { Thermometer, BarChart2, TrendingUp, Calendar, Home } from 'lucide-react'

export type TabId = 'temperature' | 'market' | 'supply' | 'calendar' | 'home'

const TABS: { id: TabId; label: string; Icon: React.ComponentType<{ size: number }> }[] = [
  { id: 'temperature', label: '온도계',  Icon: Thermometer },
  { id: 'market',      label: '시장',    Icon: BarChart2 },
  { id: 'supply',      label: '수급',    Icon: TrendingUp },
  { id: 'calendar',    label: '일정',    Icon: Calendar },
  { id: 'home',        label: '홈',      Icon: Home },
]

interface Props {
  active: TabId
  onChange: (id: TabId) => void
}

export default function BottomTabBar({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-14">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? 'text-blue-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
