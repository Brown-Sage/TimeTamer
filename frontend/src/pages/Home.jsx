import { useNavigate, useParams } from 'react-router-dom'
import '../styles/Home.css'
import Timer from '../components/Timer'
import '../styles/Timer.css'
import { MdImportExport, MdOutlineMenuOpen } from 'react-icons/md'
import Menu from '../components/Menu'
import SpotifyFrame from '../components/SpotifyFrame'
import '../styles/SpotifyFrame.css'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import Settings from '../components/Settings'
import TimeProgress from '../components/TimeProgress';
import Lottie from 'lottie-react'
import SmallAnimations from '../components/SmallAnimations';
import Goal from '../components/Goal'
import '../styles/Goal.css'

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
        if (username) {
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
        axios
            .get('api/user/')
            .then(({ data }) => {
                console.log('get user resp: ', data)
                sertUser(data)
            })
            .catch((err) => {
                console.log('something went wrong', err)
            })
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
                    {/* <button onClick={() => navigate("/settings")}>
                        <MdOutlineMenuOpen color="white" fontSize={30} />
                    </button> */}

                    {username &&
                    window.localStorage.getItem('authenticated') == 'true' ? (
                        <div>
                            {user && <div>{`Hey! ${user.username}`}</div>}
                            <button onClick={() => handleLogout()}>
                                logout
                            </button>
                        </div>
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
                <div className="header-right">
                    
                </div>
            </div>
            <div className="mid">
                <Goal/>
            </div>
            <div className="spotify">
                <SpotifyFrame trackUri="7ouMYWpwJ422jRcDASZB7P" />
            </div>
            <div className="Maintimer">
                <Timer />
            </div>
            <TimeProgress />
            <Menu />
            <SmallAnimations />
        </div>
    )
}

export default Home
