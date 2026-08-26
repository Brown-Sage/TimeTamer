import { useEffect, useRef, useState } from 'react'
import { IoWaterOutline, IoFlameOutline, IoCloudyOutline, IoVolumeMediumOutline } from 'react-icons/io5'

// Ambient soundscapes synthesized with the Web Audio API — no audio files.
// Each scene is filtered noise (and/or slow LFO) shaped to feel like rain,
// a crackling fire, or distant cafe murmur.
const SCENES = [
    {
        key: 'rain',
        label: 'Rain',
        icon: IoWaterOutline,
        build: (ctx) => {
            const noise = makeNoise(ctx)
            const filter = ctx.createBiquadFilter()
            filter.type = 'bandpass'
            filter.frequency.value = 1400
            filter.Q.value = 0.6
            // slow intensity swell like shifting rainfall
            const lfo = ctx.createOscillator()
            const lfoGain = ctx.createGain()
            lfo.frequency.value = 0.07
            lfoGain.gain.value = 300
            lfo.connect(lfoGain).connect(filter.frequency)
            lfo.start()
            const hiss = makeNoise(ctx)
            const hp = ctx.createBiquadFilter()
            hp.type = 'highpass'
            hp.frequency.value = 4500
            const hissGain = ctx.createGain()
            hissGain.gain.value = 0.25
            hiss.connect(hp).connect(hissGain)
            return [noise.connect(filter), hissGain]
        },
    },
    {
        key: 'fire',
        label: 'Hearth',
        icon: IoFlameOutline,
        build: (ctx) => {
            const noise = makeNoise(ctx)
            const lowpass = ctx.createBiquadFilter()
            lowpass.type = 'lowpass'
            lowpass.frequency.value = 420
            const crackleLfo = ctx.createOscillator()
            const crackleGain = ctx.createGain()
            crackleLfo.type = 'sine'
            crackleLfo.frequency.value = 0.9
            crackleGain.gain.value = 180
            crackleLfo.connect(crackleGain).connect(lowpass.frequency)
            crackleLfo.start()
            return [noise.connect(lowpass)]
        },
    },
    {
        key: 'cafe',
        label: 'Cafe',
        icon: IoCloudyOutline,
        build: (ctx) => {
            const noise = makeNoise(ctx)
            const band = ctx.createBiquadFilter()
            band.type = 'lowpass'
            band.frequency.value = 800
            const murmurLfo = ctx.createOscillator()
            const murmurGain = ctx.createGain()
            murmurLfo.frequency.value = 0.22
            murmurGain.gain.value = 250
            murmurLfo.connect(murmurGain).connect(band.frequency)
            murmurLfo.start()
            return [noise.connect(band)]
        },
    },
]

function makeNoise(ctx) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1
        last = (last + 0.02 * white) / 1.02 // brownish noise
        data[i] = last * 3.2
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true
    src.start()
    return src
}

export default function SoundScape() {
    const ctxRef = useRef(null)
    const masterRef = useRef(null)
    const activeNodesRef = useRef([])
    const [activeKey, setActiveKey] = useState(null)
    const [volume, setVolume] = useState(0.5)

    useEffect(() => {
        if (masterRef.current) masterRef.current.gain.value = volume
    }, [volume])

    const ensureCtx = () => {
        if (!ctxRef.current) {
            ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
            masterRef.current = ctxRef.current.createGain()
            masterRef.current.gain.value = volume
            masterRef.current.connect(ctxRef.current.destination)
        }
        if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
        return ctxRef.current
    }

    const stopAll = () => {
        // Close the whole context: guarantees every looping noise source
        // (including the ones created inside scene builders) stops dead.
        try {
            ctxRef.current?.close()
        } catch { /* already closed */ }
        ctxRef.current = null
        masterRef.current = null
        activeNodesRef.current = []
    }

    const toggleScene = (scene) => {
        if (activeKey === scene.key) {
            stopAll()
            setActiveKey(null)
            return
        }
        stopAll()
        const ctx = ensureCtx()
        const outputs = scene.build(ctx)
        outputs.forEach((out) => out.connect(masterRef.current))
        activeNodesRef.current = outputs
        setActiveKey(scene.key)
    }

    useEffect(() => () => stopAll(), [])

    return (
        <div className="flex items-center gap-0.5">
            <IoVolumeMediumOutline size={16} className="text-cream/60" />
            {SCENES.map(({ key, label, icon: Icon }) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => toggleScene(SCENES.find((s) => s.key === key))}
                    aria-pressed={activeKey === key}
                    title={label}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        activeKey === key
                            ? 'bg-ember/85 text-cocoa'
                            : 'text-parchment hover:bg-white/8 hover:text-cream'
                    }`}
                >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="ml-1 h-1 w-14 cursor-pointer accent-ember"
                aria-label="Ambience volume"
            />
        </div>
    )
}
