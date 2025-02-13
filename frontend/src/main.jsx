import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('New version available. Reload?')) {
            updateSW(true)
        }
    },
    onOfflineReady() {
        console.log('App is ready to work offline.')
    },
})

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
)
