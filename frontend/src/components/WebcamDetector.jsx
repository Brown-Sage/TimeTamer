import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const WEIGHTS_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const DETECTION_INTERVAL = 300;  // Run every 300ms for faster response
const ABSENCE_THRESHOLD = 3;     // 3 counts (900ms) threshold for faster pause

const WebcamDetector = ({ onUserPresenceChange, isEnabled = false }) => {
    const videoRef = useRef(null);
    const faceapiRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [isWebcamEnabled, setIsWebcamEnabled] = useState(isEnabled);
    const [error, setError] = useState(null);
    const detectionIntervalRef = useRef(null);
    const noFaceCountRef = useRef(0);

    // Update webcam state when isEnabled prop changes
    useEffect(() => {
        setIsWebcamEnabled(isEnabled);
    }, [isEnabled]);

    // Load face-api.js and the model weights only when the webcam is first
    // enabled. The library is ~1.5MB, so it must stay out of the main bundle.
    useEffect(() => {
        if (!isWebcamEnabled || isModelLoaded || isModelLoading) return undefined;

        let cancelled = false;
        setIsModelLoading(true);
        (async () => {
            try {
                const faceapi = await import('face-api.js');
                await faceapi.nets.tinyFaceDetector.loadFromUri(WEIGHTS_URL);
                if (cancelled) return;
                faceapiRef.current = faceapi;
                setIsModelLoaded(true);
            } catch (err) {
                console.error('Failed to load face detection model:', err);
                if (!cancelled) {
                    setError('Failed to load face detection model. Please check your internet connection and try again.');
                    setIsWebcamEnabled(false);
                }
            } finally {
                if (!cancelled) setIsModelLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [isWebcamEnabled, isModelLoaded, isModelLoading]);

    // Handle face detection
    useEffect(() => {
        if (!isModelLoaded || !isWebcamEnabled) return undefined;

        const lastReportedPresenceRef = { current: true };

        const detectFace = async () => {
            try {
                const video = videoRef.current;
                const faceapi = faceapiRef.current;
                if (!video || !faceapi) return;

                const detections = await faceapi.detectAllFaces(
                    video,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,
                        scoreThreshold: 0.15,   // Even lower threshold for better sensitivity
                    })
                );

                const faceFound = detections.length > 0;

                if (faceFound) {
                    // Reset our no-face counter.
                    noFaceCountRef.current = 0;

                    // ALWAYS report presence when face is found, regardless of previous state
                    // This ensures the timer component knows immediately when to resume
                    onUserPresenceChange(true);

                    // Also force a second call after a short delay to ensure it's processed
                    if (!lastReportedPresenceRef.current) {
                        setTimeout(() => {
                            onUserPresenceChange(true);
                        }, 200);
                    }

                    // Update last reported state
                    lastReportedPresenceRef.current = true;
                } else {
                    noFaceCountRef.current += 1;
                    // Only report a change (to false) once when we exceed the threshold.
                    if (noFaceCountRef.current >= ABSENCE_THRESHOLD && lastReportedPresenceRef.current === true) {
                        lastReportedPresenceRef.current = false;
                        onUserPresenceChange(false);
                    }
                }
            } catch (err) {
                console.error('Face detection error:', err);
            }
        };

        // Wait for the video to load before starting detection.
        const video = videoRef.current;
        if (video) {
            const handleLoadedData = () => {
                // Initialize counters and assume face is present.
                noFaceCountRef.current = 0;
                lastReportedPresenceRef.current = true;
                onUserPresenceChange(true);
                detectionIntervalRef.current = setInterval(detectFace, DETECTION_INTERVAL);
            };
            video.addEventListener('loadeddata', handleLoadedData, { once: true });

            return () => {
                video.removeEventListener('loadeddata', handleLoadedData);
                clearInterval(detectionIntervalRef.current);
            };
        }

        return () => clearInterval(detectionIntervalRef.current);
    }, [isModelLoaded, isWebcamEnabled, onUserPresenceChange]);

    // Handle webcam setup
    useEffect(() => {
        if (!isWebcamEnabled) return undefined;
        let stream = null;

        const setupWebcam = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640, min: 320 },
                        height: { ideal: 480, min: 240 },
                        facingMode: 'user',
                        frameRate: { ideal: 30, min: 15 }  // Higher frameRate for better detection
                    }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Wait for video to be fully ready before starting detection
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play().catch(err => {
                            console.error('Error playing video:', err);
                        });
                    };
                }
            } catch (err) {
                console.error('Webcam setup error:', err);
                setError('Failed to access webcam. Please make sure your camera is connected and you have granted permission.');
                setIsWebcamEnabled(false);
            }
        };

        setupWebcam();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isWebcamEnabled]);

    const toggleWebcam = () => {
        setIsWebcamEnabled(!isWebcamEnabled);
        if (!isWebcamEnabled) {
            setError(null);
            onUserPresenceChange(false);
            noFaceCountRef.current = 0;
        }
    };

    return (
        <div className="webcam-detector">
            <button
                onClick={toggleWebcam}
                className={`webcam-toggle ${isWebcamEnabled ? 'active' : ''}`}
            >
                {isWebcamEnabled ? 'Disable Webcam' : 'Enable Webcam'}
            </button>
            {error && <div className="webcam-error">{error}</div>}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    display: 'none',  // Hide the video element
                    width: '160px',
                    height: '120px'
                }}
                width="640"
                height="480"
            />
        </div>
    );
};

WebcamDetector.propTypes = {
    onUserPresenceChange: PropTypes.func.isRequired,
    isEnabled: PropTypes.bool
};

export default WebcamDetector;
