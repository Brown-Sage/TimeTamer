import { useState } from 'react'
import '../styles/Login.css'
import { toast } from 'react-toastify'
import api from '../lib/api'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async () => {
        if (!username || !password) {
            toast.error('Please enter your username and password')
            return
        }

        const formData = new FormData()
        formData.append('username', username)
        formData.append('password', password)

        try {
            const { data } = await api.post('api/login/', formData)
            window.localStorage.setItem('username', data.user.username)
            toast.success('Login Successful :)')
            window.location.href = `/${data.user.username}`
        } catch (err) {
            if (err.response?.status === 400) {
                toast.error('Invalid Credentials!')
            } else {
                toast.error(
                    err.response?.data?.message ||
                        'Something went wrong. Please try again.'
                )
            }
        }
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
