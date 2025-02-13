import { useNavigate, useParams } from 'react-router-dom'
import '../styles/Home.css'
import Timer from '../components/Timer'
import '../styles/Timer.css'
import { MdOutlineMenuOpen } from 'react-icons/md'
import Menu from '../components/Menu'
import SpotifyFrame from '../components/SpotifyFrame'
import '../styles/SpotifyFrame.css'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'

function Home() {
    const navigate = useNavigate()
    const { username } = useParams()
    const [user, sertUser] = useState()
    // const [authenticated, setAuthenticated] = useState(JSON.parse(window.localStorage.getItem('authenticated')))
    useEffect(() => {
        // let auth = JSON.parse(window.localStorage.getItem('authenticated'))
        console.log(
            'auth?',
            window.localStorage.getItem('authenticated')
            // typeof auth
        )
        if (user) {
            getUser()
        }
        // if (window.localStorage.getItem('authenticated') == 'true') {
        //     toast.success('logged in!!')
        // } else {
        //     toast.error(':(')
        // }
    }, [])

    const getUser = () => {
        console.log('get user data')
    }

    const handleLogout = () => {
        axios.defaults.baseURL = ''
        axios
            .delete('api/logout/')
            .then((resp) => {
                console.log('logout resp', resp)
                toast.success('logout successful :)')
                window.localStorage.removeItem('authenticated')
                window.location.href = `/`
            })
            .catch((err) => {
                console.log('logout err', err)
                // window.location.reload
            })
    }

    return (
        <div className="container">
            <div className="MainHead">
                <div className="header-left">
                    <button>
                        <MdOutlineMenuOpen color="white" fontSize={30} />
                    </button>
                </div>
                <div className="header-right">
                    {username &&
                    window.localStorage.getItem('authenticated') == 'true' ? (
                        <button onClick={() => handleLogout()}>logout</button>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')}>
                                Log In
                            </button>
                            <button onClick={() => navigate('/signin')}>
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="spotify">
                <SpotifyFrame trackUri="7ouMYWpwJ422jRcDASZB7P" />
            </div>

            <div className="Maintimer">
                <div className="Options">
                    <button className="child1">Focus</button>
                    <button className="child1">Break</button>
                    <button className="child1">Long Break</button>
                </div>
                <Timer />
            </div>

            <Menu />
        </div>
    )
}

export default Home
