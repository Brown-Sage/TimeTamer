import { useState } from 'react'
import '../styles/Signin.css' // Reusing the same CSS file
import api from '../lib/api'
import { toast } from 'react-toastify'

export default function SignIn() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async () => {
        if (!email || !username || !password) {
            toast.error('All fields are required')
            return
        }

        const formData = new FormData()
        formData.append('email', email)
        formData.append('username', username)
        formData.append('password', password)

        try {
            await api.post('api/register/', formData)
            toast.success('Registration Successful :)')
            window.location.href = '/login/'
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    'Registration failed. Please try again.'
            )
        }
    }

    return (
        <div>
            <div className="overlay">
                <div className="popup-signin">
                    <button
                        className="close-btn"
                        onClick={() => window.history.back()}
                    >
                        ✖
                    </button>
                    <h1>Create Your Account 🚀</h1>
                    <label>Email:</label>
                    <input
                        type="email"
                        placeholder="Email"
                        className="input-box"
                        onChange={(e) => setEmail(e.target.value)}
                    />
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
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    )
}
