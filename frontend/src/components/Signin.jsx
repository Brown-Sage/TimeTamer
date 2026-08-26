import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AuthShell, Field } from './Login'
import api from '../lib/api'

export default function SignIn() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
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
            toast.success('Account created — log in to continue :)')
            window.location.href = '/login/'
        } catch (err) {
            toast.error(
                err.response?.data?.message || 'Registration failed. Please try again.'
            )
        }
    }

    return (
        <AuthShell
            title="Create your account"
            subtitle="One minute to set up. Forever to focus."
            cta="Sign up"
            onSubmit={handleSubmit}
            footer={
                <>
                    Already aboard?{' '}
                    <Link to="/login" className="font-semibold text-ember hover:underline">
                        Log in
                    </Link>
                </>
            }
        >
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Username" value={username} onChange={setUsername} type="text" />
            <Field label="Password" value={password} onChange={setPassword} type="password" />
        </AuthShell>
    )
}
