import React, { useState } from 'react'
import '../styles/Signin.css' // Reusing the same CSS file
import axios from 'axios'
import { toast } from 'react-toastify'
export default function SignIn() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = () => {
      console.log('register')
      toast.error('Registration Failed :(')
      
        const formData = new FormData()

        formData.append('email', email)
        formData.append('username', username)
        formData.append('password', password)

        let config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }

        axios.defaults.baseURL = ''
        axios.post('api/register/', formData, config).then((resp) => {
            console.log('REGISTER RESP', resp)
            toast.success('Registration Successful :)')
            window.location.href = '/login/'
        })
    }

    return (
        <div className="container">
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
                    {/* <label>Confirm Password:</label>
            <input type="password" placeholder="Confirm Password" className="input-box" /> */}
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