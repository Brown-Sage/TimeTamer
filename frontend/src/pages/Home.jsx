import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    IoStatsChartOutline,
    IoPulseOutline,
    IoOptionsOutline,
    IoColorPaletteOutline,
    IoMusicalNotesOutline,
    IoCheckboxOutline,
    IoPaperPlaneOutline,
    IoClose,
} from 'react-icons/io5'
import AmbientScene from '../components/AmbientScene'
import FocusCard from '../components/FocusCard'
import TasksPanel from '../components/TasksPanel'
import NotesDrawer from '../components/NotesDrawer'
import SoundScape from '../components/SoundScape'
import ClockRail from '../components/ClockRail'
import SpotifyFrame from '../components/SpotifyFrame'
import { useAuth } from '../context/AuthContext'

const DRAWERS = [
    { key: 'tasks', label: 'Tasks', icon: IoCheckboxOutline },
    { key: 'notes', label: 'Notes', icon: IoPaperPlaneOutline },
]

const NAV = [
    { key: 'stats', label: 'Stats', icon: IoStatsChartOutline, to: '/stats' },
    { key: 'track', label: 'Track', icon: IoPulseOutline, to: '/track' },
    { key: 'settings', label: 'Tune', icon: IoOptionsOutline, to: '/settings' },
    { key: 'skin', label: 'Skin', icon: IoColorPaletteOutline, to: '/theme' },
]

// navigate away and close any open drawer so returning home is clean
function useNavAndClose(navigate, setDrawer) {
    return (to) => {
        setDrawer(null)
        navigate(to)
    }
}

export default function Home() {
    const navigate = useNavigate()
    const { user, loading, logout } = useAuth()
    const [drawer, setDrawer] = useState(null) // 'tasks' | 'notes' | null
    const [showSpotify, setShowSpotify] = useState(false)
    const navAway = useNavAndClose(navigate, setDrawer)

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <div className="relative flex min-h-screen flex-col">
            <AmbientScene />

            {/* ---- Top corners: greeting / auth ---- */}
            <header className="flex flex-wrap items-start justify-between gap-3 p-5 sm:p-8">
                <div>
                    <p className="font-display text-sm font-semibold tracking-wide text-cream/70">
                        {greeting()}
                        {user ? `, ${user.username}` : ''}
                    </p>
                    {!loading && !user && (
                        <div className="mt-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="rounded-full bg-ember px-4 py-1.5 text-xs font-bold text-cocoa transition hover:bg-golden"
                            >
                                Log in
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/signin')}
                                className="rounded-full border border-white/10 bg-raised px-4 py-1.5 text-xs font-bold text-parchment transition hover:text-cream"
                            >
                                Sign up
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:block">
                        <ClockRail />
                    </div>
                    {!loading && user && (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-full border border-white/10 bg-raised px-4 py-2 text-xs font-bold text-parchment transition hover:text-clay"
                        >
                            Exit
                        </button>
                    )}
                </div>
            </header>

            {/* ---- Center stage: floating timer ---- */}
            <main className="flex flex-1 items-center justify-center px-4 pb-36 pt-4">
                <FocusCard />
            </main>

            {/* ---- Bottom center: sound + tool rail ---- */}
            <footer className="fixed bottom-4 left-1/2 z-30 max-w-[96vw] -translate-x-1/2">
                <nav className="flex flex-wrap items-center justify-center gap-0.5 rounded-full border border-white/10 bg-panel px-2.5 py-2 sm:flex-nowrap sm:justify-start sm:overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <SoundScape />
                    <span className="mx-1 h-5 w-px shrink-0 bg-white/10" />
                    {DRAWERS.map(({ key, label, icon: Icon }) => (
                        <RailButton
                            key={key}
                            active={drawer === key}
                            onClick={() => setDrawer(drawer === key ? null : key)}
                            label={label}
                        >
                            <Icon size={17} />
                        </RailButton>
                    ))}
                    <span className="mx-1 h-5 w-px shrink-0 bg-white/10" />
                    {NAV.map(({ key, label, icon: Icon, to }) => (
                        <RailButton
                            key={key}
                            onClick={() => navAway(to)}
                            label={label}
                        >
                            <Icon size={17} />
                        </RailButton>
                    ))}
                    <span className="mx-1 h-5 w-px shrink-0 bg-white/10" />
                    <RailButton
                        active={showSpotify}
                        onClick={() => setShowSpotify((v) => !v)}
                        label="Music"
                    >
                        <IoMusicalNotesOutline size={17} />
                    </RailButton>
                </nav>
            </footer>

            {/* ---- Right slide-over drawers ---- */}
            <aside
                className={`fixed right-0 top-0 z-40 flex h-full w-[22rem] max-w-[92vw] flex-col gap-4 overflow-y-auto p-4 pb-28 pt-24 transition-transform duration-300 ease-out ${
                    drawer ? 'translate-x-0' : 'pointer-events-none translate-x-full'
                }`}
                aria-hidden={!drawer}
            >
                {drawer === 'tasks' && (
                    <section className="rounded-3xl border border-white/10 bg-panel flex min-h-0 flex-1 flex-col overflow-hidden p-6">
                        <TasksPanel embedded />
                    </section>
                )}
                {drawer === 'notes' && (
                    <section className="rounded-3xl border border-white/10 bg-panel flex min-h-0 flex-1 flex-col overflow-hidden p-6">
                        <NotesDrawer embedded />
                    </section>
                )}
                {drawer && (
                    <button
                        type="button"
                        onClick={() => setDrawer(null)}
                        className="mx-auto flex items-center gap-2 rounded-full border border-white/10 bg-raised px-5 py-2 text-xs font-bold text-parchment hover:text-cream"
                    >
                        <IoClose size={14} /> close
                    </button>
                )}
            </aside>

            {/* Backdrop click-away when a drawer is open */}
            {drawer && (
                <button
                    type="button"
                    aria-label="Close drawer"
                    onClick={() => setDrawer(null)}
                    className="fixed inset-0 z-20 cursor-default bg-black/25"
                />
            )}

            {/* Spotify floats top-right when open */}
            {showSpotify && (
                <div className="rounded-3xl border border-white/10 bg-panel fixed bottom-24 right-4 z-30 w-80 max-w-[90vw] p-3">
                    <div className="mb-2 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowSpotify(false)}
                            aria-label="Close music"
                            className="rounded-full p-1 text-parchment transition hover:text-clay"
                        >
                            <IoClose size={16} />
                        </button>
                    </div>
                    <SpotifyFrame playlistId="37i9dQZF1DXcBWIGoYBM5M" embedded />
                </div>
            )}
        </div>
    )
}

function RailButton({ children, label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            className={`flex shrink-0 flex-col items-center gap-0.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                active
                    ? 'bg-ember/85 text-cocoa'
                    : 'text-parchment hover:bg-white/10 hover:text-cream'
            }`}
        >
            {children}
            <span>{label}</span>
        </button>
    )
}

function greeting() {
    const h = new Date().getHours()
    if (h < 5) return 'still up'
    if (h < 12) return 'good morning'
    if (h < 18) return 'good afternoon'
    return 'good evening'
}
