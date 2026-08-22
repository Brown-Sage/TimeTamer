import api from './api'

// localStorage keys that are backed up to / restored from the server
export const SETTINGS_SYNC_KEYS = [
    'timerSettings',
    'timerNotifications',
    'timerAlarm',
    'timerWebcamDetection',
    'goalAlarm',
]

// ---- Focus sessions -------------------------------------------------------

// Fire-and-forget push of one completed session. Failures are ignored:
// the session stays in localStorage and gets merged back later.
export function pushFocusSession(session) {
    return api
        .post('api/sessions/', {
            sessions: [{
                minutes: session.minutes,
                timestamp: session.timestamp,
                client_id: String(Math.floor(Date.parse(session.timestamp) / 1000)),
            }],
        })
        .catch(() => {})
}

// Merge server-side history into the local log (dedup by minute-bucket).
// Local-first: works fully offline; server only adds missing rows.
export async function pullFocusSessions() {
    const { data } = await api.get('api/sessions/')
    const server = Array.isArray(data?.sessions) ? data.sessions : []
    if (server.length === 0) return

    const local = JSON.parse(localStorage.getItem('focusSessions') || '[]')
    const seen = new Set(local.map((s) => bucketKey(s.timestamp)))
    let added = 0
    for (const s of server) {
        const key = bucketKey(s.timestamp)
        if (!seen.has(key)) {
            seen.add(key)
            local.push({ minutes: s.minutes, timestamp: s.timestamp })
            added += 1
        }
    }
    if (added > 0) {
        local.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        localStorage.setItem('focusSessions', JSON.stringify(local))
        window.dispatchEvent(new CustomEvent('timetamer:sessions-synced'))
    }
}

// Bucket timestamps by minute so JS "…000Z" and Python "…+00:00" ISO forms match.
function bucketKey(timestamp) {
    const ms = Date.parse(timestamp)
    return Number.isNaN(ms) ? String(timestamp) : String(Math.floor(ms / 60000))
}

// ---- Settings -------------------------------------------------------------

// Restore settings saved on another device. Only fills keys the server has.
// Components re-read state when they receive 'timetamer:settings-synced'.
export async function applyRemoteSettings() {
    const { data } = await api.get('api/settings/')
    const remote = data?.settings
    if (!remote || typeof remote !== 'object') return false

    for (const key of SETTINGS_SYNC_KEYS) {
        if (!(key in remote)) continue
        const value = remote[key]
        localStorage.setItem(
            key,
            typeof value === 'object' && value !== null
                ? JSON.stringify(value)
                : String(value)
        )
    }
    window.dispatchEvent(new CustomEvent('timetamer:settings-synced'))
    return true
}

// Periodically back up the tracked localStorage keys to the server.
// Catches every writer (any component touching localStorage) without
// needing to modify each one. Returns a cleanup function.
export function startSettingsBackup(intervalMs = 30000) {
    let lastSnapshot = JSON.stringify(readSettings())

    const flush = () => {
        const snapshot = JSON.stringify(readSettings())
        if (snapshot === lastSnapshot) return Promise.resolve()
        lastSnapshot = snapshot
        return api.put('api/settings/', { settings: readSettings() }).catch(() => {})
    }

    const timer = setInterval(flush, intervalMs)
    const onHide = () => {
        if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('beforeunload', flush)

    return () => {
        clearInterval(timer)
        document.removeEventListener('visibilitychange', onHide)
        window.removeEventListener('beforeunload', flush)
        flush()
    }
}

function readSettings() {
    const out = {}
    for (const key of SETTINGS_SYNC_KEYS) {
        const raw = localStorage.getItem(key)
        if (raw === null) continue
        try {
            out[key] = JSON.parse(raw)
        } catch {
            out[key] = raw
        }
    }
    return out
}
