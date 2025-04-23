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
import Track from '../components/Track'
import QuickNote from '../components/QuickNote'

function Home() {
    const navigate = useNavigate()
    const { username } = useParams()
    const [user, sertUser] = useState()
    const [suggestions, setSuggestions] = useState([])
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
        getSuggestions()
        // if (window.localStorage.getItem('authenticated') == 'true') {
        //     toast.success('logged in!!')
        // } else {
        //     toast.error(':(')
        // }
    }, [])

    const getSuggestions = () => {
        console.log('login')
        const formData = new FormData()
        formData.append('user', "4ffb4ce7-19fb-4049-a908-0ecc639c9916")
        let user ="4ffb4ce7-19fb-4049-a908-0ecc639c9916"
        let url = `https://n8n.aitech.work/webhook-test/pomodoro/suggestions?user=${user}`  
        axios
            .get(url)
            .then((resp) => {
                console.log("SUGGESTIONS RESP", resp)
            })
            .catch((err) => {
                console.log('sugges err', err)
            })
    }
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
                <SpotifyFrame playlistId="37i9dQZF1DXcBWIGoYBM5M" />
            </div>
            <div><Track /></div>
            <div className="Maintimer">
                <Timer />
            </div>
            <div className="quick-note">
                <QuickNote />
            </div>
            <div>{suggestions && <>
                
            </>}</div>
            <TimeProgress />
            <Menu />
            <SmallAnimations />
        </div>
    )
}

export default Home
