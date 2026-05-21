export type ViewMode = 'map' | 'sector' | 'industry'

const VIEWS: Array<{ id: ViewMode; label: string }> = [
  { id: 'map',      label: '맵' },
  { id: 'sector',   label: '섹터' },
  { id: 'industry', label: '산업' },
]

interface Props {
  value: ViewMode
  onChange: (v: ViewMode) => void
}

export default function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
      {VIEWS.map(v => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            value === v.id
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}
