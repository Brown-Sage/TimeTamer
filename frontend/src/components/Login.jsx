import React, { useState } from 'react'
import '../styles/Login.css'
import { toast } from 'react-toastify'
import axios from 'axios'

export default function Login() {
    const [username, setUsername] = useState('')
    // const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = () => {
        const base_url = import.meta.env.VITE_BASE_URL
        console.log('login')
        const formData = new FormData()

        formData.append('username', username)
        formData.append('password', password)

        let config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }

        axios.defaults.baseURL = ''
        axios
            .post(`${base_url}/login`, formData, config)
            .then(({ data }) => {
                console.log('login resp', data[0])
                let resp = data[0]
                window.localStorage.setItem('authenticated', true)
                window.localStorage.setItem('username', resp.username)
                window.localStorage.setItem('user_id', resp.id)

                toast.success('Login Successful :)')
                console.log(
                    'auth?',
                    window.localStorage.getItem('authenticated'),
                    window.localStorage.getItem('username'),
                    window.localStorage.getItem('user_id')
                )

                window.location.href = `/${username}`
            })
            .catch((err) => {
                console.log('login err', err)

                window.localStorage.setItem('authenticated', false)
                toast.error('Invalid Credentials!')
                // window.location.href = `/`
            })
    }

    return (
        <div>
            <div className="overlay">
                <div className="popup">
                    <button
                        className="close-btn"
                        onClick={() => window.history.back()}
                    >
                        ✖
                    </button>
                    <h1>Welcome Back</h1>
                    <label>Username:</label>
                    <input
                        type="text"
                        placeholder="Username"
                        className="input-box"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label>Password:</label>
                    <input
                        type="password"
                        placeholder="Password"
                        className="input-box"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        className="login-btn"
                        onClick={() => handleSubmit()}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    )
}
