import { useState, useEffect } from 'react'

function useNow() {
    const [now, setNow] = useState(() => new Date())
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(id)
    }, [])
    return now
}

// Compact clock pill for the top-right corner of the scene.
export default function ClockRail() {
    const now = useNow()

    const h = now.getHours()
    const period = h >= 12 ? 'PM' : 'AM'
    const h12 = String(h % 12 || 12).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')

    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    })

    return (
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-panel px-4 py-2.5">
            <span className="font-display text-xl font-semibold tabular-nums text-cream">
                {h12}:{mm}
                <span className="ml-1 text-xs font-medium text-parchment">{ss}</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-ember">{period}</span>
            <span className="hidden text-xs text-parchment md:inline">{dateStr}</span>
        </div>
    )
}
