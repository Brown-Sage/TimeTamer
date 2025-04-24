import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import PropTypes from 'prop-types';

const WebcamDetector = ({ onUserPresenceChange, isEnabled = false }) => {
    const videoRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isWebcamEnabled, setIsWebcamEnabled] = useState(isEnabled);
    const [error, setError] = useState(null);
    const detectionIntervalRef = useRef(null);
    const noFaceCountRef = useRef(0);
    const [debugInfo, setDebugInfo] = useState({ faceDetected: false, detections: [] });

    // Update webcam state when isEnabled prop changes
    useEffect(() => {
        setIsWebcamEnabled(isEnabled);
    }, [isEnabled]);

    // Load face detection model
    useEffect(() => {
        const loadModel = async () => {
            try {
                console.log('Loading face detection model...');
                await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
                console.log('Face detection model loaded successfully');
                setIsModelLoaded(true);
            } catch (err) {
                console.error('Failed to load face detection model:', err);
                setError('Failed to load face detection model. Please check your internet connection and try again.');
            }
        };

        loadModel();
    }, []);

    // Handle face detection
    useEffect(() => {
        if (!isModelLoaded || !isWebcamEnabled) return;

        const DETECTION_INTERVAL = 300;  // Run every 300ms for faster response
        const ABSENCE_THRESHOLD = 3;     // 3 counts (900ms) threshold for faster pause

        // Use a ref to persist the last reported presence status
        const lastReportedPresenceRef = { current: true };

        const detectFace = async () => {
            try {
                if (!videoRef.current) return;
                
                const detections = await faceapi.detectAllFaces(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,
                        scoreThreshold: 0.15,   // Even lower threshold for better sensitivity
                    })
                );
                
                const faceFound = detections.length > 0;
                setDebugInfo({ 
                    faceDetected: faceFound, 
                    detections: detections.map(d => ({
                        score: d.score,
                        box: `${Math.round(d.box.x)},${Math.round(d.box.y)} - ${Math.round(d.box.width)}x${Math.round(d.box.height)}`
                    }))
                });
                
                console.log(`Face detection: ${faceFound ? 'Face found' : 'No face'}`);
                if (faceFound) {
                    // Reset our no-face counter.
                    noFaceCountRef.current = 0;
                    
                    // ALWAYS report presence when face is found, regardless of previous state
                    // This ensures the timer component knows immediately when to resume
                    console.log('Face detected - ALWAYS reporting user presence as true');
                    onUserPresenceChange(true);
                    
                    // Also force a second call after a short delay to ensure it's processed
                    if (!lastReportedPresenceRef.current) {
                        setTimeout(() => {
                            console.log('Sending backup presence true signal');
                            onUserPresenceChange(true);
                        }, 200);
                    }
                    
                    // Update last reported state
                    lastReportedPresenceRef.current = true;
                } else {
                    noFaceCountRef.current++;
                    console.log('No face count:', noFaceCountRef.current);
                    // Only report a change (to false) once when we exceed the threshold.
                    if (noFaceCountRef.current >= ABSENCE_THRESHOLD && lastReportedPresenceRef.current === true) {
                        console.log('No face detected for threshold - setting user presence to false');
                        lastReportedPresenceRef.current = false;
                        onUserPresenceChange(false);
                    }
                }
            } catch (err) {
                console.error('Face detection error:', err);
            }
        };

        // Wait for the video to load before starting detection.
        if (videoRef.current) {
            videoRef.current.addEventListener('loadeddata', () => {
                console.log('Video loaded – starting detection loop');
                // Initialize counters and assume face is present.
                noFaceCountRef.current = 0;
                lastReportedPresenceRef.current = true;
                onUserPresenceChange(true);
                detectionIntervalRef.current = setInterval(detectFace, DETECTION_INTERVAL);
            }, { once: true });
        }

        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
        };
    }, [isModelLoaded, isWebcamEnabled, onUserPresenceChange]);

    // Handle webcam setup
    useEffect(() => {
        if (!isWebcamEnabled) return;

        const setupWebcam = async () => {
            try {
                console.log('Setting up webcam...');
                const stream = await navigator.mediaDevices.getUserMedia({
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
                        console.log('Video metadata loaded');
                        videoRef.current.play().catch(err => {
                            console.error('Error playing video:', err);
                        });
                    };
                    console.log('Webcam setup complete');
                }
            } catch (err) {
                console.error('Webcam setup error:', err);
                setError('Failed to access webcam. Please make sure your camera is connected and you have granted permission.');
                setIsWebcamEnabled(false);
            }
        };

        setupWebcam();

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
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
            
            {/* Debug info display */}
            {isWebcamEnabled && (
                <div className="webcam-debug" style={{ 
                    display: 'none',
                    fontSize: '11px', 
                    opacity: 0.8, 
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    padding: '4px',
                    maxWidth: '300px',
                    borderRadius: '4px',
                    marginTop: '4px'
                }}>
                    Face detected: {debugInfo.faceDetected ? 'Yes' : 'No'}
                    {debugInfo.detections.length > 0 && (
                        <div>
                            {debugInfo.detections.map((d, i) => (
                                <div key={i}>
                                    Score: {d.score.toFixed(2)}, Box: {d.box}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
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