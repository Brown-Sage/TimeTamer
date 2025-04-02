import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import PropTypes from 'prop-types';

const WebcamDetector = ({ onUserPresenceChange }) => {
    const videoRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
    const [error, setError] = useState(null);
    const [lastFaceDetected, setLastFaceDetected] = useState(false);
    const detectionInterval = useRef(null);
    const noFaceCountRef = useRef(0);

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

        const DETECTION_INTERVAL = 500; // Check every 500ms
        const MAX_NO_FACE_COUNT = 6; // 3 seconds total (6 * 500ms)

        const detectFace = async () => {
            try {
                if (!videoRef.current) return;

                const detections = await faceapi.detectAllFaces(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions({
                        inputSize: 224,
                        scoreThreshold: 0.1
                    })
                );

                const faceFound = detections.length > 0;
                console.log(`Face detection: ${faceFound ? 'Face found' : 'No face'}`);

                if (faceFound) {
                    noFaceCountRef.current = 0;
                    if (!lastFaceDetected) {
                        console.log('Face detected - resuming timer');
                        setLastFaceDetected(true);
                        onUserPresenceChange(true);
                    }
                } else {
                    noFaceCountRef.current++;
                    console.log(`No face count: ${noFaceCountRef.current}`);
                    
                    if (noFaceCountRef.current >= MAX_NO_FACE_COUNT) {
                        console.log('No face detected for 3 seconds - pausing timer');
                        setLastFaceDetected(false);
                        onUserPresenceChange(false);
                    }
                }
            } catch (err) {
                console.error('Face detection error:', err);
                setLastFaceDetected(false);
                onUserPresenceChange(false);
            }
        };

        // Reset no face count when webcam is enabled
        noFaceCountRef.current = 0;
        setLastFaceDetected(false);
        onUserPresenceChange(false);

        // Start detection loop
        detectionInterval.current = setInterval(detectFace, DETECTION_INTERVAL);

        return () => {
            if (detectionInterval.current) {
                clearInterval(detectionInterval.current);
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
                        width: 640,
                        height: 480,
                        facingMode: 'user'
                    }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
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
            setLastFaceDetected(false);
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
                muted
                style={{ display: 'none' }}
            />
        </div>
    );
};

WebcamDetector.propTypes = {
    onUserPresenceChange: PropTypes.func.isRequired
};

export default WebcamDetector; 