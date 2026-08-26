import { useEffect, useState, useCallback } from 'react'
import Lottie from 'lottie-react'
import streakAnimation from '../assets/animations/streak.json'
import rocketAnimation from '../assets/animations/rocket.json'
import starAnimation from '../assets/animations/star.json'
import { pullFocusSessions } from '../lib/sync'

function StatCard({ label, value, animation, accent }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-panel p-6 transition-transform hover:-translate-y-1">
            <div className="mb-3 flex items-center gap-2">
                <div className="h-9 w-9">
                    <Lottie animationData={animation} loop autoplay className="h-full w-full" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${accent}`}>
                    {label}
                </span>
            </div>
            <p className="font-display text-5xl font-semibold text-cream">{value}</p>
        </div>
    )
}

export default function Stats() {
    const [currentStreak, setCurrentStreak] = useState(
        () => parseInt(localStorage.getItem('currentStreak') || '0', 10) || 0
    )
    const [bestRecord, setBestRecord] = useState(
        () => parseInt(localStorage.getItem('bestRecord') || '0', 10) || 0
    )
    const [productiveDays, setProductiveDays] = useState(
        () => parseInt(localStorage.getItem('productiveDays') || '0', 10) || 0
    )
    const [lastStreakUpdate, setLastStreakUpdate] = useState(
        () => localStorage.getItem('lastStreakUpdate') || new Date().toLocaleDateString()
    )
    const [completedFocusSessions, setCompletedFocusSessions] = useState(
        () => localStorage.getItem('completedFocusSessions') === 'true'
    )

    // Streaks reset each visit in the old app; keep that behavior but track
    // today's sessions so the numbers mean something within the visit.
    useEffect(() => {
        localStorage.setItem('currentStreak', String(currentStreak))
        localStorage.setItem('bestRecord', String(bestRecord))
        localStorage.setItem('productiveDays', String(productiveDays))
        localStorage.setItem('lastStreakUpdate', lastStreakUpdate)
        localStorage.setItem('completedFocusSessions', String(completedFocusSessions))
    }, [currentStreak, bestRecord, productiveDays, lastStreakUpdate, completedFocusSessions])

    useEffect(() => {
        const today = new Date().toLocaleDateString()
        if (lastStreakUpdate !== today) {
            if (completedFocusSessions) {
                setCurrentStreak((prev) => {
                    const next = prev + 1
                    setBestRecord((b) => Math.max(b, next))
                    setProductiveDays((d) => d + 1)
                    return next
                })
            } else {
                setCurrentStreak(0)
            }
            setLastStreakUpdate(today)
            setCompletedFocusSessions(false)
        }
    }, [lastStreakUpdate, completedFocusSessions])

    const todaysFocusMinutes = useCallback(() => {
        const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]')
        const today = new Date().toLocaleDateString()
        return sessions
            .filter((s) => new Date(s.timestamp).toLocaleDateString() === today)
            .reduce((total, s) => total + s.minutes, 0)
    }, [])

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

    const updateWeek = useCallback(() => {
        const label = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
        setFocusWeek((prev) => {
            let next = [...prev]
            const idx = next.findIndex((d) => d.date === label)
            if (idx >= 0) next[idx] = { ...next[idx], time: todaysFocusMinutes() }
            else {
                if (next.length >= 7) next = next.slice(1)
                next.push({ date: label, time: todaysFocusMinutes() })
            }
            localStorage.setItem('focusTimeData', JSON.stringify(next))
            return next
        })
    }, [todaysFocusMinutes])

    useEffect(() => {
        pullFocusSessions()
            .catch(() => {})
            .finally(updateWeek)
    }, [updateWeek])

    useEffect(() => {
        const onSessionDone = () => {
            setCompletedFocusSessions(true)
            updateWeek()
        }
        window.addEventListener('focusSessionCompleted', onSessionDone)
        return () => window.removeEventListener('focusSessionCompleted', onSessionDone)
    }, [updateWeek])

    const totalWeek = focusWeek.reduce((s, d) => s + d.time, 0)
    const bestDay = Math.max(0, ...focusWeek.map((d) => d.time))

    return (
        <div className="mx-auto max-w-4xl p-8 sm:p-12">
            <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                    <h1 className="font-display text-3xl font-semibold text-cream">Stats</h1>
                    <div className="h-10 w-10">
                        <Lottie
                            animationData={streakAnimation}
                            loop
                            autoplay
                            className="h-full w-full"
                        />
                    </div>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-parchment">
                    Streak active since {lastStreakUpdate}
                </p>
            </header>

            <div className="mb-6 grid gap-5 sm:grid-cols-3">
                <StatCard
                    label="Streak"
                    value={currentStreak}
                    animation={starAnimation}
                    accent="text-sage"
                />
                <StatCard
                    label="Best"
                    value={bestRecord}
                    animation={rocketAnimation}
                    accent="text-ember"
                />
                <StatCard
                    label="Productive days"
                    value={productiveDays}
                    animation={starAnimation}
                    accent="text-clay"
                />
            </div>

            <div className="rounded-3xl border border-white/10 bg-panel p-7">
                <h2 className="mb-1 font-display text-xl font-semibold text-cream">
                    Focus this week
                </h2>
                <p className="mb-6 text-sm text-parchment">
                    {Math.floor(totalWeek / 60)}h {totalWeek % 60}m total · best day{' '}
                    {bestDay}m
                </p>
                <ul className="flex h-44 items-end gap-3">
                    {focusWeek.map((d) => {
                        const max = Math.max(1, ...focusWeek.map((x) => x.time))
                        const h = Math.max(4, (d.time / max) * 100)
                        return (
                            <li key={d.date} className="flex flex-1 flex-col items-center gap-2">
                                <span className="text-[11px] font-semibold tabular-nums text-parchment">
                                    {d.time > 0 ? `${d.time}m` : ''}
                                </span>
                                <div
                                    className="w-full rounded-t-md bg-gradient-to-t from-ember/30 to-golden/80 transition-all"
                                    style={{ height: `${h}%` }}
                                    title={`${d.date}: ${d.time} min`}
                                />
                                <span className="text-[11px] text-parchment">{d.date}</span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}
