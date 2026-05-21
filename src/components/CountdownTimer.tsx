import { useState, useEffect } from 'react'

interface Props { targetDatetime: string }

export default function CountdownTimer({ targetDatetime }: Props) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(targetDatetime).getTime() - Date.now()
      if (diff <= 0) { setRemaining('발표됨'); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setRemaining(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetDatetime])

  return (
    <div className="border-t border-b border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 py-2 px-4 my-1 flex items-center justify-center gap-3">
      <span className="text-xs text-blue-600 dark:text-blue-400">다음 발표까지</span>
      <span className="text-sm font-bold font-mono text-blue-700 dark:text-blue-300">{remaining}</span>
    </div>
  )
}
