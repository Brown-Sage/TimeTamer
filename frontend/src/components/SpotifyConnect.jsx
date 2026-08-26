import { useEffect, useState } from 'react'
import { FaSpotify } from 'react-icons/fa'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

// Dock entry for Spotify: connect navigates to the backend, which 302s to
// the Spotify consent screen; the callback lands back in the SPA.
export default function SpotifyConnect() {
    const { user } = useAuth()
    const [connected, setConnected] = useState(false)
    const [configured, setConfigured] = useState(true)

    useEffect(() => {
        if (!user) return undefined
        let cancelled = false
        api.get('api/spotify/status/')
            .then(({ data }) => {
                if (cancelled) return
                setConnected(Boolean(data?.connected))
                setConfigured(Boolean(data?.configured))
            })
            .catch(() => {})
        return () => {
            cancelled = true
        }
    }, [user])

    if (!user) return null

    const handleClick = () => {
        if (connected) {
            api.delete('api/spotify/disconnect/')
                .then(() => setConnected(false))
                .catch(() => {})
            return
        }
        window.location.assign('/api/spotify/login/')
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-colors ${
                connected
                    ? 'border-sage/40 bg-sage/15 text-sage hover:brightness-110'
                    : 'border-white/10 bg-black/20 text-parchment hover:border-ember/70 hover:text-cream'
            }`}
        >
            <FaSpotify size={18} />
            {connected ? 'Spotify linked' : configured ? 'Link Spotify' : 'Set up music'}
        </button>
    )
}
