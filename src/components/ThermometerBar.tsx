interface Props {
  score: number  // 0~100
}

export default function ThermometerBar({ score }: Props) {
  const pct = Math.min(100, Math.max(0, score))
  return (
    <div className="relative h-3 rounded-full my-3" style={{
      background: 'linear-gradient(to right, #3B82F6, #06B6D4, #EAB308, #F97316, #EF4444, #991B1B)'
    }}>
      <div
        className="absolute w-5 h-5 bg-white rounded-full border-2 border-black/15 shadow-sm"
        style={{
          left: `${pct}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}
