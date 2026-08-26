import { useState, useEffect, useCallback } from 'react'
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts'
import { pullFocusSessions } from '../lib/sync'

const fmt = (minutes) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function Track() {
    const [focusWeek, setFocusWeek] = useState(() => {
        const saved = localStorage.getItem('focusTimeData')
        if (saved) return JSON.parse(saved)
        const week = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            return {
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                time: 0,
            }
        })
        localStorage.setItem('focusTimeData', JSON.stringify(week))
        return week
    })

    const todaysMinutes = useCallback(() => {
        const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]')
        const today = new Date().toLocaleDateString()
        return sessions
            .filter((s) => new Date(s.timestamp).toLocaleDateString() === today)
            .reduce((t, s) => t + s.minutes, 0)
    }, [])

    const updateWeek = useCallback(() => {
        const label = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
        setFocusWeek((prev) => {
            let next = [...prev]
            const idx = next.findIndex((d) => d.date === label)
            if (idx >= 0) next[idx] = { ...next[idx], time: todaysMinutes() }
            else {
                if (next.length >= 7) next = next.slice(1)
                next.push({ date: label, time: todaysMinutes() })
            }
            localStorage.setItem('focusTimeData', JSON.stringify(next))
            return next
        })
    }, [todaysMinutes])

    useEffect(() => {
        updateWeek()
        pullFocusSessions()
            .then(updateWeek)
            .catch(() => {})
    }, [updateWeek])

    useEffect(() => {
        window.addEventListener('focusSessionCompleted', updateWeek)
        return () => window.removeEventListener('focusSessionCompleted', updateWeek)
    }, [updateWeek])

    const stats = {
        today: todaysMinutes(),
        total: focusWeek.reduce((s, d) => s + d.time, 0),
        avg: Math.round(focusWeek.reduce((s, d) => s + d.time, 0) / focusWeek.length),
        best: Math.max(0, ...focusWeek.map((d) => d.time)),
    }

    return (
        <div className="mx-auto max-w-4xl p-8 sm:p-12">
            <header className="mb-8 border-b border-white/10 pb-5">
                <h1 className="font-display text-3xl font-semibold text-cream">Track</h1>
                <p className="mt-1 text-sm text-parchment">
                    Your focus history, one week at a glance.
                </p>
            </header>

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    ['Today', fmt(stats.today)],
                    ['Daily avg', fmt(stats.avg)],
                    ['This week', fmt(stats.total)],
                    ['Best day', fmt(stats.best)],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-3xl border border-white/10 bg-panel p-5 text-center">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-parchment">
                            {label}
                        </p>
                        <p className="mt-2 font-display text-2xl font-semibold text-cream">
                            {value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-panel h-96 p-6">
                <h2 className="mb-4 font-display text-lg font-semibold text-cream">
                    Daily focus · last 7 days
                </h2>
                <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={focusWeek} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                        <defs>
                            <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f6c177" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#e8a87c" stopOpacity={0.03} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(233,237,245,0.07)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#c9c2b4', fontSize: 12 }}
                            axisLine={{ stroke: 'rgba(245,241,232,0.15)' }}
                            tickLine={false}
                            dy={8}
                        />
                        <YAxis
                            tick={{ fill: '#c9c2b4', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => (v === 0 ? '0' : `${v}m`)}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(43,38,34,0.85)',
                                border: '1px solid rgba(245,241,232,0.12)',
                                borderRadius: '14px',
                                color: '#f5f1e8',
                                fontSize: '13px',
                            }}
                            formatter={(v) => [fmt(v), 'Focus']}
                            cursor={{ stroke: 'rgba(232,168,124,0.4)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="time"
                            stroke="#e8a87c"
                            strokeWidth={2.5}
                            fill="url(#glow)"
                            activeDot={{ r: 6, fill: '#f5f1e8', stroke: '#e8a87c', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
