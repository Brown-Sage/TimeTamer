import { useState, useEffect, useRef } from 'react'
import { IoMdAdd } from 'react-icons/io'
import { FaTrash } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTimer } from '../context/TimerContext'
import { pullTasks, pushTasks } from '../lib/sync'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
const BADGE = {
    high: 'bg-clay/20 text-clay',
    medium: 'bg-ember/20 text-ember',
    low: 'bg-sage/20 text-sage',
}

export default function TasksPanel({ embedded = false }) {
    const { user } = useAuth()
    const { timerPreferences } = useTimer()

    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('tasks')
        return saved ? JSON.parse(saved) : []
    })
    const [text, setText] = useState('')
    const [duration, setDuration] = useState('')
    const [priority, setPriority] = useState('medium')
    const [, tick] = useState(0)
    const pushTimer = useRef(null)

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks))
    }, [tasks])

    const syncedOnce = useRef(false)
    useEffect(() => {
        if (!user) {
            syncedOnce.current = false
            return undefined
        }
        let cancelled = false
        pullTasks().then((merged) => {
            if (!cancelled && Array.isArray(merged)) {
                setTasks(merged)
                syncedOnce.current = true
            }
        })
        return () => {
            cancelled = true
        }
    }, [user])

    useEffect(() => {
        if (!user || !syncedOnce.current) return undefined
        clearTimeout(pushTimer.current)
        pushTimer.current = setTimeout(() => pushTasks(tasks), 800)
        return () => clearTimeout(pushTimer.current)
    }, [tasks, user])

    // Per-second tick for running task timers + auto-complete/auto-switch.
    useEffect(() => {
        if (!tasks.some((t) => t.isRunning)) return undefined
        const interval = setInterval(() => {
            tick((n) => n + 1)
            setTasks((current) => {
                let autoStartNextId = null
                const updated = current.map((task, idx) => {
                    if (!task.isRunning) return task
                    const elapsedMinutes = task.startTime
                        ? (Date.now() - task.startTime) / 60000
                        : task.elapsedTime
                    if (task.duration > 0 && task.duration - elapsedMinutes <= 0) {
                        let done = { ...task, isRunning: false, elapsedTime: task.duration }
                        if (timerPreferences.autoCheckTasks) {
                            done = { ...done, completed: true, completedAt: new Date().toISOString() }
                            if (timerPreferences.autoSwitchTasks && autoStartNextId === null) {
                                const next = current.find(
                                    (c, i) => i !== idx && !c.completed && c.duration > 0
                                )
                                autoStartNextId = next ? next.id : null
                            }
                        }
                        return done
                    }
                    return { ...task, elapsedTime: elapsedMinutes }
                })
                if (autoStartNextId !== null) {
                    return updated.map((t) =>
                        t.id === autoStartNextId ? { ...t, startTime: Date.now(), isRunning: true } : t
                    )
                }
                return updated
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [tasks, timerPreferences])

    const addTask = () => {
        if (!text.trim()) return
        setTasks((prev) => [
            ...prev,
            {
                id: Date.now(),
                text: text.trim(),
                completed: false,
                duration: parseInt(duration, 10) || 0,
                startTime: null,
                isRunning: false,
                priority,
                elapsedTime: 0,
                createdAt: new Date().toISOString(),
                completedAt: null,
            },
        ])
        setText('')
        setDuration('')
        setPriority('medium')
    }

    const toggleCompletion = (id) =>
        setTasks((prev) =>
            prev.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          completed: !t.completed,
                          completedAt: !t.completed ? new Date().toISOString() : null,
                          isRunning: false,
                      }
                    : t
            )
        )

    const remainingOf = (task) => {
        if (!task.startTime || !task.isRunning) return task.duration - task.elapsedTime
        return Math.max(0, task.duration - (Date.now() - task.startTime) / 60000)
    }

    const fmt = (mf) => {
        const m = Math.floor(mf)
        const s = Math.floor((mf - m) * 60)
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const today = new Date().toLocaleDateString()
    const visible = [...tasks]
        .filter((t) => new Date(t.createdAt).toLocaleDateString() === today)
        .sort((a, b) =>
            a.completed === b.completed
                ? PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
                : a.completed
                  ? 1
                  : -1
        )
    const doneCount = visible.filter((t) => t.completed).length

    return (
        <div className={`flex min-h-0 flex-col ${embedded ? 'h-full' : ''}`}>
            <header className="mb-4 flex shrink-0 items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-cream">
                    today&apos;s tasks
                </h2>
                <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                        visible.length > 0 && doneCount === visible.length
                            ? 'bg-sage/25 text-sage'
                            : 'bg-white/8 text-parchment'
                    }`}
                >
                    {doneCount}/{visible.length}
                </span>
            </header>

            <div className="mb-4 flex shrink-0 gap-1.5">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="what needs doing?"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-cream placeholder:text-parchment/50 outline-none focus:border-ember/60"
                />
                <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="min"
                    className="w-14 rounded-xl border border-white/10 bg-black/20 px-2 py-2 text-center text-sm text-cream placeholder:text-parchment/50 outline-none focus:border-ember/60"
                />
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/20 px-1.5 py-2 text-xs text-parchment outline-none focus:border-ember/60"
                >
                    <option value="high" className="bg-cocoa">High</option>
                    <option value="medium" className="bg-cocoa">Med</option>
                    <option value="low" className="bg-cocoa">Low</option>
                </select>
                <button
                    type="button"
                    onClick={addTask}
                    aria-label="Add task"
                    className="flex w-9 shrink-0 items-center justify-center rounded-xl bg-ember text-cocoa transition hover:bg-golden"
                >
                    <IoMdAdd size={18} />
                </button>
            </div>

            <ul className="-mr-1 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {visible.length === 0 && (
                    <li className="py-8 text-center text-sm text-parchment/60">
                        nothing yet — add your first above.
                    </li>
                )}
                {visible.map((task) => {
                    const finished = task.isRunning && remainingOf(task) <= 0
                    return (
                        <li
                            key={task.id}
                            className="group flex items-center gap-2.5 rounded-2xl border border-white/8 bg-black/15 p-3 transition-colors hover:bg-black/25"
                        >
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleCompletion(task.id)}
                                className="h-4 w-4 shrink-0 cursor-pointer accent-[#e8a87c]"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`truncate text-sm font-semibold ${
                                            task.completed ? 'text-parchment/50 line-through' : 'text-cream'
                                        }`}
                                    >
                                        {task.text}
                                    </span>
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${BADGE[task.priority]}`}
                                    >
                                        {task.priority}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                    {task.duration > 0 && (
                                        <>
                                            <span
                                                className={`font-display text-xs tabular-nums ${
                                                    finished
                                                        ? 'text-clay'
                                                        : task.isRunning
                                                          ? 'text-sage'
                                                          : 'text-parchment/60'
                                                }`}
                                            >
                                                {fmt(remainingOf(task))}
                                            </span>
                                            {!task.completed && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRun(task)}
                                                    className={`text-[11px] font-bold uppercase tracking-wider ${
                                                        task.isRunning ? 'text-clay' : 'text-sage'
                                                    }`}
                                                >
                                                    {task.isRunning ? 'stop' : 'start'}
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {task.completed && task.completedAt && (
                                        <span className="text-[11px] text-parchment/50">
                                            done ·{' '}
                                            {new Date(task.completedAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => deleteTask(task.id)}
                                aria-label={`Delete ${task.text}`}
                                className="shrink-0 rounded-full p-1 text-parchment/40 opacity-0 transition-all hover:text-clay group-hover:opacity-100"
                            >
                                <FaTrash size={12} />
                            </button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )

    function toggleRun(task) {
        task.isRunning ? stopTimer(task.id) : startTimer(task.id)
    }

    function startTimer(id) {
        setTasks((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, startTime: Date.now() - t.elapsedTime * 60000, isRunning: true } : t
            )
        )
    }

    function stopTimer(id) {
        setTasks((prev) =>
            prev.map((t) =>
                t.id === id
                    ? {
                          ...t,
                          isRunning: false,
                          elapsedTime: t.startTime ? (Date.now() - t.startTime) / 60000 : t.elapsedTime,
                      }
                    : t
            )
        )
    }

    function deleteTask(id) {
        setTasks((prev) => prev.filter((t) => t.id !== id))
    }
}
