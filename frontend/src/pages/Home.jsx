import { useNavigate } from 'react-router-dom'
import '../styles/Home.css'
import Timer from '../components/Timer'
import Menu from '../components/Menu'
import SpotifyFrame from '../components/SpotifyFrame'
import { toast } from 'react-toastify'
import TimeProgress from '../components/TimeProgress'
import Goal from '../components/Goal'
import QuickNote from '../components/QuickNote'
import { useAuth } from '../context/AuthContext'

function Home() {
    const navigate = useNavigate()
    const { user, loading, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        toast.success('logout successful :)')
        window.location = '/'
    }

    return (
        <div className="container home">
            <header className="topbar">
                <button
                    type="button"
                    className="brand"
                    onClick={() => navigate('/')}
                >
                    TimeTamer
                </button>

                <div className="topbar-right">
                    <TimeProgress />
                    {!loading && user ? (
                        <>
                            <span className="greeting-chip">
                                hey, {user.username}
                            </span>
                            <button
                                type="button"
                                className="ghost-btn"
                                onClick={handleLogout}
                            >
                                logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="primary-btn"
                                onClick={() => navigate('/login')}
                            >
                                Log In
                            </button>
                            <button
                                type="button"
                                className="soft-btn"
                                onClick={() => navigate('/signin')}
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </header>

            <main className="stage">
                <div className="Maintimer">
                    <Timer />
                </div>
            </main>

            <aside className="side-rail">
                <SpotifyFrame playlistId="37i9dQZF1DXcBWIGoYBM5M" />
            </aside>

            <Goal />
            <QuickNote />
            <Menu />
        </div>
    )
}

export default Home
