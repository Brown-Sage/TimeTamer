import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AmbientScene from './AmbientScene'

const GRADIENTS = [
    'linear-gradient(160deg, #1c1830, #3b2b52 45%, #6b4060 75%, #8f5560)',
    'linear-gradient(160deg, #0f2027, #203a43, #2c5364)',
    'linear-gradient(160deg, #232526, #414345)',
    'linear-gradient(160deg, #2b1055, #7597de)',
    'linear-gradient(160deg, #1a2980, #26d0ce)',
    'linear-gradient(160deg, #141e30, #243b55)',
    'linear-gradient(160deg, #000428, #004e92)',
    'linear-gradient(160deg, #360033, #0b8793)',
]

function applyBackground(value, isImage = false) {
    const el = document.documentElement
    el.style.background = isImage ? `url(${value})` : value
    el.style.backgroundAttachment = 'fixed'
    el.style.backgroundSize = 'cover'
    el.style.backgroundPosition = 'center'
    el.classList.add('custom-background')
}

export default function Theme() {
    const [tab, setTab] = useState('gallery')
    const navigate = useNavigate()

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [])

    const applyGradient = (bg) => {
        applyBackground(bg)
        localStorage.setItem('selectedBackground', bg)
        localStorage.removeItem('selectedBackgroundImage')
        setTimeout(() => navigate('/'), 250)
    }

    const handleUpload = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            if (file.size > 10 * 1024 * 1024) {
                alert('Image is too large — pick one under 10MB.')
                return
            }
            const reader = new FileReader()
            reader.onload = (event) => {
                const data = event.target?.result
                if (!data) return
                try {
                    applyBackground(data, true)
                    localStorage.setItem('selectedBackgroundImage', data)
                    localStorage.removeItem('selectedBackground')
                } catch {
                    localStorage.setItem('hasCustomBackground', 'true')
                }
                setTimeout(() => navigate('/'), 250)
            }
            reader.onerror = () => alert('Could not read that file. Try again.')
            reader.readAsDataURL(file)
        }
        input.click()
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center p-6">
            <AmbientScene />
            <div className="rounded-3xl border border-white/10 bg-panel flex max-h-[85vh] w-full max-w-lg flex-col p-7">
                <header className="mb-5 flex items-center justify-between">
                    <h2 className="font-display text-2xl font-semibold text-cream">Skin</h2>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        aria-label="Close"
                        className="rounded-full px-4 py-1.5 text-sm font-semibold text-parchment transition hover:text-cream"
                    >
                        esc
                    </button>
                </header>

                <div className="mb-5 flex gap-1 rounded-full border border-white/10 bg-black/20 p-1">
                    {['gallery', 'upload'].map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            className={`flex-1 rounded-full py-2 text-xs font-bold tracking-wide transition-colors ${
                                tab === key ? 'bg-ember/90 text-cocoa' : 'text-parchment hover:text-cream'
                            }`}
                        >
                            {key === 'gallery' ? 'gradients' : 'your image'}
                        </button>
                    ))}
                </div>

                {tab === 'gallery' ? (
                    <div className="-mr-2 grid grid-cols-3 gap-3 overflow-y-auto pr-2 sm:grid-cols-4">
                        {GRADIENTS.map((bg, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => applyGradient(bg)}
                                aria-label={`Apply gradient ${i + 1}`}
                                className="aspect-video rounded-2xl border border-white/10 transition-transform hover:scale-105 hover:border-ember/70"
                                style={{ background: bg }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-6">
                        <p className="text-sm text-parchment">
                            any image under 10MB — it stays on this device.
                        </p>
                        <button
                            type="button"
                            onClick={handleUpload}
                            className="rounded-full bg-ember px-6 py-3 font-display text-sm font-bold text-cocoa transition hover:bg-golden"
                        >
                            choose an image
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
