import { useNavigate, useParams } from 'react-router-dom'
import '../styles/Home.css'
import Timer from '../components/Timer'
import '../styles/Timer.css'
// import { MdImportExport, MdOutlineMenuOpen } from 'react-icons/md'
import Menu from '../components/Menu'
import SpotifyFrame from '../components/SpotifyFrame'
import '../styles/SpotifyFrame.css'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
// import Settings from '../components/Settings'
import TimeProgress from '../components/TimeProgress'
// import Lottie from 'lottie-react'
import SmallAnimations from '../components/SmallAnimations'
import Goal from '../components/Goal'
import '../styles/Goal.css'
// import Track from '../components/Track'
import QuickNote from '../components/QuickNote'
// import parse from 'html-react-parser'
// import { color } from '@mui/system'

function Home() {
    const navigate = useNavigate()
    const { username } = useParams()
    const [user, sertUser] = useState()
    // const [suggestions, setSuggestions] = useState(null)
    // const [acitvityInfo, setAcitvityInfo] = useState(null)

    useEffect(() => {
        console.log(
            'auth?',
            window.localStorage.getItem('authenticated')
        )

        if (username) {
            const base_url = import.meta.env.VITE_BASE_URL
            let user_id = localStorage.getItem('user_id')
            console.log('userid', user_id)
            getUser(base_url, user_id)
        }
    }, [])

    // const getSuggestions = (mins) => {
    //     console.log('GETTING SUGGESTIONS')

    //     let base_url = import.meta.env.VITE_BASE_URL
    //     let user_id = localStorage.getItem('user_id')
    //     if (base_url && user_id) {
    //         let url = `${base_url}/suggestions?user_id=${user_id}`
    //         axios
    //             .get(url)
    //             .then(({ data }) => {
    //                 console.log('SUGGESTIONS RESP', data)
    //                 let sugg = JSON.parse(data[0]?.text)
    //                 console.log('SUGGESTIONS FETCH', sugg)
    //                 setAcitvityInfo(null)
    //                 setSuggestions(sugg)
    //             })
    //             .catch((err) => {
    //                 console.log('sugges err', err)
    //             })
    //     } else {
    //         let data = [
    //             {
    //                 text: '["Take a short walk outside", "Do some light stretching exercises", "Practice deep breathing techniques", "Listen to calming music", "Read a funny article"]',
    //             },
    //         ]
    //         let sugg = JSON.parse(data[0]?.text)
    //         console.log('SUGGESTIONS FETCH', sugg)
    //         setSuggestions(sugg)
    //     }
    // }

    // const getActivityInfo = (activity) => {
    //     let base_url = import.meta.env.VITE_BASE_URL
    //     console.log('ACTIVITY SELECTED:', activity)
    //     axios.defaults.baseURL = ''
    //     axios
    //         .get(`${base_url}/activity-info?acitvity=${activity}`)
    //         .then(({ data }) => {
    //             console.log('ACTIVITY INFO:', data)
    //             let htmlString = data[0]?.text
    //             setAcitvityInfo(htmlString)
    //         })
    //         .catch((e) => {
    //             console.log('ACTIVITY ERR', e)
    //         })
    // }

    const getUser = (base_url, user_id) => {
        console.log('get user data')
        axios
            .get(`${base_url}/get-user?user=${user_id}`)
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
                window.localStorage.removeItem('username')
                window.localStorage.removeItem('user_id')
                window.location = '/'
            })
            .catch((err) => {
                console.log('logout err', err)
                toast.success('logout successful :)')
                window.localStorage.removeItem('authenticated')
                window.localStorage.removeItem('username')
                window.localStorage.removeItem('user_id')
                window.location = '/'
            })
    }

    return (
        <div className="container">
            <div className="MainHead">
                <div className="header-left">
                    {username &&
                    window.localStorage.getItem('authenticated') == 'true' ? (
                        <div>
                            {user && (
                                <div>{`Hey! ${window.localStorage.getItem(
                                    'username'
                                )}`}</div>
                            )}
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
                <div className="header-right"></div>
            </div>
            <div className="mid">
                <Goal />
            </div>
            <div className="spotify">
                <SpotifyFrame playlistId="37i9dQZF1DXcBWIGoYBM5M" />
            </div>
            {/* {suggestions ? (
                <div className="suggestions-box">
                    {!acitvityInfo ? (
                        <>
                            <h3>
                                Here are some of the activities you can do while
                                on break.
                            </h3>
                            <p>
                                {
                                    '(Click on an activity to know more about that activity.)'
                                }
                            </p>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    fontSize: 15,
                                }}
                            >
                                {suggestions
                                    ? suggestions.map((sugg, idx) => {
                                          return (
                                              <div
                                                  style={{
                                                      padding: 10,
                                                      margin: 5,
                                                      border: 'solid 1px #000',
                                                      borderRadius: 5,
                                                      cursor: 'pointer',
                                                  }}
                                                  className="suggestion"
                                                  key={idx}
                                                  onClick={() =>
                                                      getActivityInfo(sugg)
                                                  }
                                              >
                                                  {sugg}
                                              </div>
                                          )
                                      })
                                    : null}
                            </div>
                        </>
                    ) : (
                        <>
                            {acitvityInfo
                                ? parse(acitvityInfo)
                                : 'No info to show :('}
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '1em',
                                    left: '1em',
                                    cursor: 'pointer',
                                }}
                                onClick={() => {
                                    setAcitvityInfo(null)
                                }}
                            >
                                X
                            </span>
                        </>
                    )}
                </div>
            ) : null} */}
            <div className="Maintimer">
                <Timer />
            </div>
            <div className="quick-note">
                <QuickNote />
            </div>
            <TimeProgress />
            <Menu />
            <SmallAnimations />
        </div>
    )
}

export default Home
