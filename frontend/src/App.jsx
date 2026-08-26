import { useEffect } from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from 'react-router-dom'
import Home from './pages/Home'
import Login from './components/Login'
import SignIn from './components/Signin'
import Settings from './components/Settings'
import Stats from './components/Stats'
import Track from './components/Track'
import Theme from './components/Theme'
import { ToastContainer } from 'react-toastify'
import { TimerProvider } from './context/TimerProvider'
import { AuthProvider } from './context/AuthProvider'

// Re-apply a wallpaper saved by the Theme overlay (image or gradient).
function loadSavedBackground() {
    const image = localStorage.getItem('selectedBackgroundImage')
    if (image) {
        const el = document.documentElement
        el.style.background = `url(${image})`
        el.style.backgroundAttachment = 'fixed'
        el.style.backgroundSize = 'cover'
        el.style.backgroundPosition = 'center'
        el.classList.add('custom-background')
        return true
    }
    const gradient = localStorage.getItem('selectedBackground')
    if (gradient) {
        const el = document.documentElement
        el.style.background = gradient
        el.style.backgroundAttachment = 'fixed'
        el.style.backgroundSize = 'cover'
        el.classList.add('custom-background')
        return true
    }
    return false
}

function AppContent() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:username" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/track" element={<Track />} />
            <Route path="/theme" element={<Theme />} />
        </Routes>
    )
}

export default function App() {
    useEffect(() => {
        loadSavedBackground()
        // Re-apply when returning from the Skin picker (same tab, remount race)
        const onFocus = () => loadSavedBackground()
        window.addEventListener('focus', onFocus)
        window.addEventListener('popstate', onFocus)
        return () => {
            window.removeEventListener('focus', onFocus)
            window.removeEventListener('popstate', onFocus)
        }
    }, [])

    return (
        <AuthProvider>
            <TimerProvider>
                <Router>
                    <AppContent />
                    <ToastContainer
                        position="bottom-right"
                        theme="dark"
                        autoClose={3000}
                        closeOnClick
                        hideProgressBar
                    />
                </Router>
            </TimerProvider>
        </AuthProvider>
    )
}
