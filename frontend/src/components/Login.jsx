import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { IoArrowForward } from 'react-icons/io5'
import api from '../lib/api'
import AmbientScene from './AmbientScene'

export function Field({ label, value, onChange, type }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-bold tracking-wide text-parchment">
                {label}
            </span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-parchment/40 focus:border-ember/70"
            />
        </label>
    )
}

export function AuthShell({ title, subtitle, cta, onSubmit, children, footer }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center p-6">
            <AmbientScene />
            <div className="rounded-3xl border border-white/10 bg-panel w-full max-w-sm p-8 sm:p-10">
                <div className="mb-8">
                    <span className="font-display text-sm font-bold tracking-[0.3em] text-ember">
                        timetamer
                    </span>
                    <h1 className="mt-3 font-display text-3xl font-semibold text-cream">
                        {title}
                    </h1>
                    <p className="mt-1.5 text-sm text-parchment">{subtitle}</p>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    {children}
                    <button
                        type="submit"
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-ember py-3 font-display text-base font-bold tracking-wide text-cocoa transition hover:bg-golden"
                    >
                        {cta}
                        <IoArrowForward size={16} />
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-parchment">{footer}</div>
            </div>
        </div>
    )
}


export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
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
            toast.success('Welcome back :)')
            navigate(`/${data.user.username}`)
        } catch (err) {
            toast.error(
                err.response?.status === 400
                    ? 'Invalid credentials!'
                    : err.response?.data?.message ||
                          'Something went wrong. Please try again.'
            )
        }
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Pick up right where you left off."
            cta="Log in"
            onSubmit={handleSubmit}
        >
            <Field label="Username" value={username} onChange={setUsername} type="text" />
            <Field label="Password" value={password} onChange={setPassword} type="password" />
            <p className="text-center text-sm text-parchment/70">
                New here?{' '}
                <Link to="/signin" className="font-semibold text-ember hover:underline">
                    Create an account
                </Link>
            </p>
        </AuthShell>
    )
}
