import { useNavigate } from 'react-router-dom'
import { IoClose } from 'react-icons/io5'
import AmbientScene from './AmbientScene'
import { useTimer } from '../context/TimerContext'

const SECTIONS = [
    {
        title: 'Flow',
        hint: 'what happens when a session ends.',
        items: [
            { key: 'autoStartBreaks', label: 'Auto-start breaks' },
            { key: 'autoStartPomodoros', label: 'Auto-start next focus' },
            { key: 'longBreakInterval', label: 'Long break every 4th session' },
        ],
    },
    {
        title: 'Tasks',
        hint: 'how task timers behave on finish.',
        items: [
            { key: 'autoCheckTasks', label: 'Auto-check finished tasks' },
            { key: 'autoSwitchTasks', label: 'Auto-start the next task' },
        ],
    },
]

export default function Settings() {
    const navigate = useNavigate()
    const { timerPreferences, updatePreference } = useTimer()

    return (
        <div className="relative flex min-h-screen items-center justify-center p-6">
            <AmbientScene />
            <div className="rounded-3xl border border-white/10 bg-panel w-full max-w-md p-8">
                <header className="mb-7 flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-semibold text-cream">Tune</h1>
                        <p className="mt-0.5 text-sm text-parchment">
                            small behaviors, your way.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        aria-label="Back to home"
                        className="rounded-full p-2 text-parchment transition hover:text-clay"
                    >
                        <IoClose size={20} />
                    </button>
                </header>

                {SECTIONS.map(({ title, hint, items }) => (
                    <section key={title} className="mb-6 last:mb-0">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-ember">
                            {title}
                        </h2>
                        <p className="mb-3 mt-0.5 text-xs text-parchment/70">{hint}</p>
                        <div className="divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10 bg-black/15">
                            {items.map(({ key, label }) => (
                                <label
                                    key={key}
                                    className="flex cursor-pointer items-center justify-between px-4 py-3.5"
                                >
                                    <span className="text-sm font-medium text-cream">{label}</span>
                                    <Toggle
                                        checked={Boolean(timerPreferences[key])}
                                        onChange={(v) => updatePreference(key, v)}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                checked ? 'bg-ember' : 'bg-black/30'
            }`}
        >
            <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream shadow transition-all duration-200 ${
                    checked ? 'left-[22px]' : 'left-0.5'
                }`}
            />
        </button>
    )
}
