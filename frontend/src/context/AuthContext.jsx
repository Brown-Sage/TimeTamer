import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react'
import PropTypes from 'prop-types'
import api from '../lib/api'
import {
    applyRemoteSettings,
    startSettingsBackup
} from '../lib/sync'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        let stopBackup = null

        // Verify the session server-side instead of trusting localStorage flags
        api.get('api/user/')
            .then(({ data }) => {
                // Only accept a well-shaped user payload
                if (!cancelled && data && typeof data === 'object' && data.uid) {
                    setUser(data)
                    // Restore settings saved on other devices
                    return applyRemoteSettings().catch(() => {})
                }
                if (!cancelled) setUser(null)
                return null
            })
            .catch(() => {
                if (!cancelled) {
                    setUser(null)
                    // Clean up legacy client-side "auth" artifacts
                    window.localStorage.removeItem('authenticated')
                    window.localStorage.removeItem('user_id')
                }
            })
            .finally(() => {
                if (!cancelled && !stopBackup) {
                    setLoading(false)
                    // Periodically back up settings while logged in
                    stopBackup = startSettingsBackup()
                }
            })

        return () => {
            cancelled = true
            if (stopBackup) stopBackup()
        }
    }, [])

    const logout = async () => {
        try {
            await api.delete('api/logout/')
        } finally {
            setUser(null)
            window.localStorage.removeItem('username')
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
