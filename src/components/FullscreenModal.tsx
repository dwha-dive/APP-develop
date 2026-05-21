import { useEffect, type ReactNode } from 'react'

interface Props {
  onClose: () => void
  children: ReactNode
}

export default function FullscreenModal({ onClose, children }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-end px-4 py-2 shrink-0">
        <button
          onClick={onClose}
          className="text-white bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 text-sm transition-colors"
        >
          닫기
        </button>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
