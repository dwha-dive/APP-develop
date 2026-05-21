import { useState } from 'react'

interface Props {
  text: string
}

export default function InfoTooltip({ text }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center justify-center"
        aria-label="정보"
      >
        ⓘ
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 bottom-7 z-50 w-64 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-xl p-3 shadow-xl leading-relaxed">
            {text}
          </div>
        </>
      )}
    </span>
  )
}
