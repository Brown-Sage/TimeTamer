import { useState } from 'react'
import { IoOptionsOutline, IoPlay, IoPause } from 'react-icons/io5'
import WebcamDetector from './WebcamDetector'
import { useTimer } from '../context/TimerContext'

const MODES = [
    { key: 'focus', label: 'focus' },
    { key: 'break', label: 'break' },
    { key: 'longbreak', label: 'long break' },
]

export default function FocusCard() {
    const {
        hours,
        minutes,
        seconds,
        isRunning,
        mode,
        focusCount,
        settings,
        timerSettings,
        setTimerSettings,
        setMinutes,
        startStop,
        handleUserPresenceChange,
        handleFocus,
        handleBreak,
        handleLongBreak,
    } = useTimer()

    const [showDial, setShowDial] = useState(false)
    const setters = { handleFocus, handleBreak, handleLongBreak }

    // Fraction of the current session elapsed (for the slim progress bar).
    const totalSeconds = Math.max(1, timerSettings[mode].minutes * 60)
    const remainingSeconds = hours * 3600 + minutes * 60 + seconds
    const progress = Math.min(1, Math.max(0, 1 - remainingSeconds / totalSeconds))

    const saveLength = (value) => {
        const clean = Math.max(1, Math.min(parseInt(value, 10) || 0, 180))
        setTimerSettings((prev) => ({
            ...prev,
            [mode]: { ...prev[mode], minutes: clean },
        }))
        setMinutes(clean)
        localStorage.setItem(
            'timerSettings',
            JSON.stringify({
                ...timerSettings,
                [mode]: { ...timerSettings[mode], minutes: clean },
            })
        )
    }

    return (
        <div className="flex w-full max-w-lg flex-col items-center">
            {/* Mode pills */}
            <div className="mb-6 flex gap-1 rounded-full border border-white/10 bg-raised p-1">
                {MODES.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={setters[key]}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-colors ${
                            mode === key
                                ? 'bg-ember/90 text-cocoa shadow-lg'
                                : 'text-parchment hover:text-cream'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Clock */}
            <div className="flex flex-col items-center">
                <div className="flex items-baseline font-display text-8xl font-medium tabular-nums tracking-tight text-cream sm:text-9xl">
                    {hours > 0 && (
                        <>
                            <span>{String(hours).padStart(2, '0')}</span>:
                        </>
                    )}
                    <span>{String(minutes).padStart(2, '0')}</span>
                    <span className="mx-0.5 text-parchment">:</span>
                    <span className="text-parchment">{String(seconds).padStart(2, '0')}</span>
                </div>

                {/* Session progress */}
                <div className="mt-4 h-1 w-56 overflow-hidden rounded-full bg-white/10 sm:w-72">
                    <div
                        className={`h-full rounded-full transition-[width] duration-500 ease-linear ${
                            mode === 'focus' ? 'bg-ember' : 'bg-sage'
                        }`}
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>

                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.25em] text-parchment/60">
                    session {focusCount} today
                </p>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center gap-3">
                <button
                    type="button"
                    onClick={startStop}
                    className={`flex min-w-36 items-center justify-center gap-2 rounded-full py-3.5 font-display text-base font-bold tracking-wide text-cocoa transition-all ${
                        isRunning
                            ? 'bg-clay/90 hover:bg-clay'
                            : 'bg-ember hover:brightness-110'
                    }`}
                >
                    {isRunning ? <IoPause size={18} /> : <IoPlay size={18} />}
                    {isRunning ? 'pause' : 'start'}
                </button>

                {settings.webcamDetection && (
                    <WebcamDetector
                        onUserPresenceChange={handleUserPresenceChange}
                        isEnabled={settings.webcamDetection}
                    />
                )}

                <button
                    type="button"
                    onClick={() => setShowDial((v) => !v)}
                    aria-label="Session length"
                    className="rounded-full border border-white/10 bg-raised p-2.5 text-parchment transition hover:text-cream"
                >
                    <IoOptionsOutline size={17} />
                </button>
            </div>

            {showDial && (
                <div className="mt-4 flex items-center gap-3 rounded-full border border-white/10 bg-panel px-5 py-3">
                    <span className="text-xs text-parchment">{mode} for</span>
                    <input
                        type="number"
                        min="1"
                        max="180"
                        defaultValue={timerSettings[mode].minutes}
                        onBlur={(e) => saveLength(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === 'Enter' && (saveLength(e.target.value), setShowDial(false))
                        }
                        autoFocus
                        className="w-14 rounded-md border border-white/10 bg-black/25 px-2 py-1 text-center text-sm text-cream outline-none focus:border-ember"
                    />
                    <span className="text-xs text-parchment">minutes</span>
                </div>
            )}
        </div>
    )
}
