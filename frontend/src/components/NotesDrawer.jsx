import { useState, useEffect, useRef } from 'react'
import { FaPlus, FaTrash } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { pullNotes, pushNotes } from '../lib/sync'

const STORAGE_KEY = 'timetamer_quick_notes'

export default function NotesDrawer({ embedded = false }) {
    const { user } = useAuth()
    const [notes, setNotes] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            const parsed = saved ? JSON.parse(saved) : []
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    })
    const [draft, setDraft] = useState('')
    const pushTimer = useRef(null)

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
        } catch (e) {
            console.error('Error saving notes:', e)
        }
    }, [notes])

    const syncedOnce = useRef(false)
    useEffect(() => {
        if (!user) {
            syncedOnce.current = false
            return undefined
        }
        let cancelled = false
        pullNotes().then((merged) => {
            if (!cancelled && Array.isArray(merged)) {
                setNotes(merged)
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
        pushTimer.current = setTimeout(() => pushNotes(notes), 800)
        return () => clearTimeout(pushTimer.current)
    }, [notes, user])

    const addNote = () => {
        if (!draft.trim()) return
        setNotes((prev) => [
            ...prev,
            { id: Date.now(), text: draft.trim(), timestamp: new Date().toLocaleString() },
        ])
        setDraft('')
    }

    return (
        <div className={`flex min-h-0 flex-col ${embedded ? 'h-full' : ''}`}>
            <h2 className="mb-4 shrink-0 font-display text-lg font-semibold text-cream">
                scratchpad
            </h2>

            <div className="mb-4 flex shrink-0 gap-1.5">
                <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                    placeholder="jot something down…"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-cream placeholder:text-parchment/50 outline-none focus:border-ember/60"
                />
                <button
                    type="button"
                    onClick={addNote}
                    aria-label="Add note"
                    className="flex w-9 shrink-0 items-center justify-center rounded-xl bg-ember text-cocoa transition hover:bg-golden"
                >
                    <FaPlus size={14} />
                </button>
            </div>

            {notes.length === 0 ? (
                <p className="py-8 text-center text-sm text-parchment/60">empty for now.</p>
            ) : (
                <ul className="-mr-1 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {[...notes].reverse().map((note) => (
                        <li
                            key={note.id}
                            className="group rounded-2xl border border-white/8 bg-black/15 p-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="break-words text-sm text-cream">{note.text}</p>
                                <button
                                    type="button"
                                    aria-label="Delete note"
                                    onClick={() =>
                                        setNotes((prev) => prev.filter((n) => n.id !== note.id))
                                    }
                                    className="shrink-0 rounded-full p-1 text-parchment/40 transition hover:text-clay"
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                            <span className="mt-1 block text-[11px] text-parchment/50">
                                {note.timestamp}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
