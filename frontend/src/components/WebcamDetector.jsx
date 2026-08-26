import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

const WEIGHTS_URL =
    'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'
const DETECTION_INTERVAL = 300
const ABSENCE_THRESHOLD = 3

const WebcamDetector = ({ onUserPresenceChange, isEnabled = false }) => {
    const videoRef = useRef(null)
    const faceapiRef = useRef(null)
    const [isModelLoaded, setIsModelLoaded] = useState(false)
    const [isModelLoading, setIsModelLoading] = useState(false)
    const [isWebcamEnabled, setIsWebcamEnabled] = useState(isEnabled)
    const [error, setError] = useState(null)
    const detectionIntervalRef = useRef(null)
    const noFaceCountRef = useRef(0)

    useEffect(() => {
        setIsWebcamEnabled(isEnabled)
    }, [isEnabled])

    // Load face-api.js lazily (~1.5MB) only when first enabled.
    useEffect(() => {
        if (!isWebcamEnabled || isModelLoaded || isModelLoading) return undefined
        let cancelled = false
        setIsModelLoading(true)
        ;(async () => {
            try {
                const faceapi = await import('face-api.js')
                await faceapi.nets.tinyFaceDetector.loadFromUri(WEIGHTS_URL)
                if (cancelled) return
                faceapiRef.current = faceapi
                setIsModelLoaded(true)
            } catch (err) {
                console.error('Failed to load face detection model:', err)
                if (!cancelled) {
                    setError('Could not load the face model. Check your connection.')
                    setIsWebcamEnabled(false)
                }
            } finally {
                if (!cancelled) setIsModelLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [isWebcamEnabled, isModelLoaded, isModelLoading])

    // Detection loop.
    useEffect(() => {
        if (!isModelLoaded || !isWebcamEnabled) return undefined

        let lastReported = true

        const detectFace = async () => {
            try {
                const video = videoRef.current
                const faceapi = faceapiRef.current
                if (!video || !faceapi) return
                const detections = await faceapi.detectAllFaces(
                    video,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,
                        scoreThreshold: 0.15,
                    })
                )
                if (detections.length > 0) {
                    noFaceCountRef.current = 0
                    onUserPresenceChange(true)
                    if (!lastReported) {
                        setTimeout(() => onUserPresenceChange(true), 200)
                    }
                    lastReported = true
                } else {
                    noFaceCountRef.current += 1
                    if (
                        noFaceCountRef.current >= ABSENCE_THRESHOLD &&
                        lastReported === true
                    ) {
                        lastReported = false
                        onUserPresenceChange(false)
                    }
                }
            } catch (err) {
                console.error('Face detection error:', err)
            }
        }

        const video = videoRef.current
        if (!video) return undefined
        const handleLoadedData = () => {
            noFaceCountRef.current = 0
            lastReported = true
            onUserPresenceChange(true)
            detectionIntervalRef.current = setInterval(detectFace, DETECTION_INTERVAL)
        }
        video.addEventListener('loadeddata', handleLoadedData, { once: true })

        return () => {
            video.removeEventListener('loadeddata', handleLoadedData)
            clearInterval(detectionIntervalRef.current)
        }
    }, [isModelLoaded, isWebcamEnabled, onUserPresenceChange])

    // Webcam stream lifecycle.
    useEffect(() => {
        if (!isWebcamEnabled) return undefined
        let stream = null
        const setup = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640, min: 320 },
                        height: { ideal: 480, min: 240 },
                        facingMode: 'user',
                        frameRate: { ideal: 30, min: 15 },
                    },
                })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play().catch((err) =>
                            console.error('Error playing video:', err)
                        )
                    }
                }
            } catch (err) {
                console.error('Webcam setup error:', err)
                setError('No camera access. Grant permission and retry.')
                setIsWebcamEnabled(false)
            }
        }
        setup()
        return () => {
            if (stream) stream.getTracks().forEach((t) => t.stop())
        }
    }, [isWebcamEnabled])

    const toggle = () => {
        setIsWebcamEnabled((v) => !v)
        setError(null)
        noFaceCountRef.current = 0
        onUserPresenceChange(true)
    }

    const status = isWebcamEnabled
        ? 'Watching · pause-safe'
        : isModelLoading
          ? 'Loading model…'
          : 'Away-pause off'

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                type="button"
                onClick={toggle}
                title={status}
                className={`chip flex items-center gap-1.5 border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                    isWebcamEnabled
                        ? 'border-sage/40 bg-sage/15 text-sage'
                        : 'border-white/10 bg-black/20 text-parchment hover:text-cream'
                }`}
            >
                <span
                    className={`h-2 w-2 rounded-full ${
                        isWebcamEnabled ? 'bg-sage animate-pulse' : 'bg-parchment'
                    }`}
                />
                Away-pause
            </button>
            {error && (
                <p className="max-w-44 rounded-sm bg-clay/20 px-2 py-1 text-[11px] text-coral">
                    {error}
                </p>
            )}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="hidden"
                width="640"
                height="480"
            />
        </div>
    )
}

WebcamDetector.propTypes = {
    onUserPresenceChange: PropTypes.func.isRequired,
    isEnabled: PropTypes.bool,
}

export default WebcamDetector
