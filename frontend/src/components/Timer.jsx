import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import "../styles/Timer.css";
import alarmsound from "../assets/mixkit-clear-announce-tones-2861.wav";
import WebcamDetector from "./WebcamDetector";
import "../styles/WebcamDetector.css";
import PropTypes from "prop-types";

function Timer(props) {
    const { getSuggestions } = props
    const [timerSettings, setTimerSettings] = useState({
        focus: { minutes: 50, seconds: 0 },
        break: { minutes: 5, seconds: 0 },
        longbreak: { minutes: 15, seconds: 0 }
    });
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(timerSettings.focus.minutes);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState('focus');
    const [focusCount, setFocusCount] = useState(() => {
        const savedData = localStorage.getItem('focusSessionData');
        if (savedData) {
            const { count, lastUpdate } = JSON.parse(savedData);
            const today = new Date().toLocaleDateString();
            if (lastUpdate === today) {
                return count;
            }
        }
        return 0;
    });
    const inputRef = useRef(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        notifications: localStorage.getItem('timerNotifications') === 'true',
        alarm: localStorage.getItem('timerAlarm') === 'true',
        webcamDetection: localStorage.getItem('timerWebcamDetection') === 'true'
    });
    const [isUserPresent, setIsUserPresent] = useState(true);
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const prevUserPresenceRef = useRef(true);
    const timerIntervalRef = useRef(null);

    // Load saved settings from localStorage on initial mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('timerSettings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            setTimerSettings(parsedSettings);
            setMinutes(parsedSettings[mode].minutes);
        }

        // Auto-enable webcam if the setting is enabled
        if (settings.webcamDetection) {
            setWebcamEnabled(true);
        }
    }, []);

    // Update webcamEnabled when webcam detection setting changes
    useEffect(() => {
        setWebcamEnabled(settings.webcamDetection);
    }, [settings.webcamDetection]);

    const startStop = () => {
        setIsRunning((prev) => !prev);
    };

    // Handle user presence changes (from webcam detection)
    const handleUserPresenceChange = (present) => {
        console.log('User presence changed:', present, 'Previous state:', isUserPresent);
        
        // Check if timer was paused due to user absence
        const wasPaused = !isRunning && !isUserPresent;
        
        // Update user presence state
        setIsUserPresent(present);
        
        // Store previous state
        prevUserPresenceRef.current = present;
        
        if (present && settings.webcamDetection) {
            // User is present - resume timer if it was paused due to absence
            if (wasPaused) {
                console.log('User returned and timer was paused - resuming timer');
                // Force timer to resume
                setTimeout(() => {
                    setIsRunning(true);
                }, 100);
            }
        } else if (!present && settings.webcamDetection && isRunning) {
            // User is not present - pause timer
            console.log('User not present, pausing timer');
            setIsRunning(false);
        }
    };

    // Handle timer settings changes
    const handleSettingChange = (setting) => {
        setSettings(prev => {
            const newSettings = {
                ...prev,
                [setting]: !prev[setting]
            };
            
            // If webcam detection is toggled on, enable the webcam
            if (setting === 'webcamDetection' && !prev.webcamDetection) {
                setWebcamEnabled(true);
            }
            
            localStorage.setItem(`timer${setting.charAt(0).toUpperCase() + setting.slice(1)}`, newSettings[setting]);
            return newSettings;
        });
    };

    const handleTimeClick = (field) => {
        if (!isRunning) {
            setEditingField(field);
            setEditValue(field === 'hours' ? hours.toString() : field === 'minutes' ? minutes.toString():seconds.toString());
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    };

    const handleTimeChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d{0,2}$/.test(value)) {
            setEditValue(value);
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveNewTime();
        }
        // Prevent navigation on backspace
        if (e.key === 'Backspace') {
            e.stopPropagation();
        }
    };

    const saveNewTime = () => {
        const value = parseInt(editValue) || 0;
        if (editingField === 'hours') {
            const newHours = Math.min(Math.max(value, 0), 99);
            setHours(newHours);
        } else if(editingField === 'minutes') {
            const newMinutes = Math.min(Math.max(value, 0), 59);
            setTimerSettings(prev => ({
                ...prev,
                [mode]: { ...prev[mode], minutes: newMinutes }
            }));
            setMinutes(newMinutes);
            localStorage.setItem('timerSettings', JSON.stringify({
                ...timerSettings,
                [mode]: { ...timerSettings[mode], minutes: newMinutes }
            }));
        }
        else if (editingField === 'seconds') {  // Seconds are not saved btw(no point in saving this)
            const newSeconds = Math.min(Math.max(value, 0), 59);
            setSeconds(newSeconds);
        }
        setEditingField(null);
    };

    const TrackFocus = () => {
        const focusTime = focusCount == 0 ? focus.minutes : focusCount * focus.minutes;
        return focusTime
    }

    useEffect(() => {
        const today = new Date().toLocaleDateString();
        localStorage.setItem('focusSessionData', JSON.stringify({
            count: focusCount,
            lastUpdate: today
        }));
    }, [focusCount]);

    useEffect(() => {
        const today = new Date().toLocaleDateString();
        const savedData = localStorage.getItem('focusSessionData');
        if (savedData) {
            const { lastUpdate } = JSON.parse(savedData);
            if (lastUpdate !== today) {
                setFocusCount(0);
                localStorage.setItem('focusSessionData', JSON.stringify({
                    count: 0,
                    lastUpdate: today
                }));
            }
        } else {
            localStorage.setItem('focusSessionData', JSON.stringify({
                count: 0,
                lastUpdate: today
            }));
        }
    }, []);

    const handleFocusSessionCompleted = () => {
        const nextCount = focusCount + 1;
        setFocusCount(nextCount);
        
        // Store session data in localStorage
        const today = new Date().toLocaleDateString();
        localStorage.setItem('focusSessionData', JSON.stringify({
            count: nextCount,
            lastUpdate: today
        }));

        // Notify Stats component about completed session
        const event = new CustomEvent('focusSessionCompleted');
        window.dispatchEvent(event);
    };

    useEffect(() => {
        let interval;
        if (isRunning) {
            if (isUserPresent || !settings.webcamDetection) {
                // Store the interval reference to allow clearing it
                interval = setInterval(() => {
                    setSeconds((prevSeconds) => {
                        if (prevSeconds === 0) { 
                            if (minutes === 0) {
                                if (hours === 0) {
                                    clearInterval(interval);
                                    setIsRunning(false);
                                    if(mode === 'focus'){
                                        if(settings.alarm) playaudio();
                                        handleFocusSessionCompleted();
                                        
                                        // Calculate total minutes for this session
                                        const sessionMinutes = timerSettings.focus.minutes;
                                        
                                        // Dispatch custom event with session data
                                        const sessionCompletedEvent = new CustomEvent('focusSessionCompleted', {
                                            detail: {
                                                minutes: sessionMinutes,
                                                timestamp: new Date().toISOString()
                                            }
                                        });
                                        window.dispatchEvent(sessionCompletedEvent);
                                        
                                        // Store session data in localStorage
                                        const savedSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
                                        savedSessions.push({
                                            minutes: sessionMinutes,
                                            timestamp: new Date().toISOString()
                                        });
                                        
                                        localStorage.setItem('focusSessions', JSON.stringify(savedSessions));
                                        
                                        if ((focusCount + 1) % 4 === 0) {
                                            handleLongBreak();
                                        } else {
                                            handleBreak();
                                        }
                                    } else if(mode === 'break' || mode === 'longbreak'){
                                        if(settings.alarm) playaudio();
                                        handleFocus();
                                    }
                                    return 0;
                                }
                                setHours((prevHours) => prevHours - 1);
                                setMinutes(59);
                                return 0;
                            }
                            setMinutes((prevMinutes) => prevMinutes - 1);
                            return 59;
                        }
                        return prevSeconds - 1;
                    });
                }, 1000);
                timerIntervalRef.current = interval;
            } else {
                // If user is not present and webcam detection is enabled, don't start the timer
                console.log("Timer not running - user not detected");
            }
        } else {
            clearInterval(interval);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
        return () => {
            clearInterval(interval);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [isRunning, minutes, seconds, hours, mode, focusCount, settings.alarm, isUserPresent, settings.webcamDetection, timerSettings.focus.minutes]);

    const handleFocus = () => {
        setIsRunning(false);
        setMode('focus');
        setMinutes(timerSettings.focus.minutes);
        setSeconds(0);
    };

    const handleBreak = () => {
        setIsRunning(false);
        setMode('break');
        setMinutes(timerSettings.break.minutes);
        setSeconds(0);
        getSuggestions(timerSettings.break.minutes)
    };

    const handleLongBreak = () => {
        setIsRunning(false);
        setMode('longbreak');
        setMinutes(timerSettings.longbreak.minutes);
        setSeconds(0);
        getSuggestions(timerSettings.longbreak.minutes)
    };
    const playaudio = () =>{
        const audio = new Audio(alarmsound)
        audio.play().catch((error) => {
            console.error('Failed to play audio:', error);
        });
    };
    

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    const closeTimer = () => {
        
        document.querySelector('.Maintimer').style.display = 'none';
    };

    return (
        <div className="timer-container">
            <div className="timer-header">
                <button className="timer-control-btn" onClick={toggleSettings}>
                    <IoSettingsSharp size={18} />
                </button>
                
                {settings.webcamDetection && (
                    <WebcamDetector 
                        onUserPresenceChange={handleUserPresenceChange} 
                        isEnabled={webcamEnabled}
                    />
                )}
                
                <button className="timer-control-btn" onClick={closeTimer}>
                    <IoClose size={18} />
                </button>
            </div>

            {showSettings && (
                <div className="timer-settings-menu">
                    <h3 className="settings-title">Timer Settings</h3>
                    <div className="settings-option">
                        <input
                            type="checkbox"
                            id="notifications"
                            checked={settings.notifications}
                            onChange={() => handleSettingChange('notifications')}
                        />
                        <label htmlFor="notifications">Enable notifications</label>
                    </div>
                    <div className="settings-option">
                        <input
                            type="checkbox"
                            id="alarm"
                            checked={settings.alarm}
                            onChange={() => handleSettingChange('alarm')}
                        />
                        <label htmlFor="alarm">Enable alarm sound</label>
                    </div>
                    <div className="settings-option">
                        <input
                            type="checkbox"
                            id="webcamDetection"
                            checked={settings.webcamDetection}
                            onChange={() => handleSettingChange('webcamDetection')}
                        />
                        <label htmlFor="webcamDetection">Enable webcam detection</label>
                    </div>
                </div>
            )}

            {settings.webcamDetection && !isUserPresent && (
                <div className="user-absence-notice">
                    Timer paused - User not detected
                </div>
            )}

            <div className="Options">
                <button onClick={handleFocus} className={`child1 ${mode === 'focus' ? 'active' : ''}`}>
                    Focus
                </button>
                <button onClick={handleBreak} className={`child1 ${mode === 'break' ? 'active' : ''}`}>
                    Break
                </button>
                <button onClick={handleLongBreak} className={`child1 ${mode === 'longbreak' ? 'active' : ''}`}>
                    Long Break
                </button>
            </div>
            <div id="timer">
                {editingField === 'hours' ? (
                    <input
                        ref={inputRef}
                        type="number"
                        value={editValue}
                        onChange={handleTimeChange}
                        onKeyDown={handleInputKeyDown}
                        onBlur={saveNewTime}
                        className="timer-input"
                        min="0"
                        max="99"
                    />
                ) : (
                    <span onClick={() => handleTimeClick('hours')}>
                        {String(hours).padStart(2, '0')}
                    </span>
                )}
                :
                {editingField === 'minutes' ? (
                    <input
                        ref={inputRef}
                        type="number"
                        value={editValue}
                        onChange={handleTimeChange}
                        onKeyDown={handleInputKeyDown}
                        onBlur={saveNewTime}
                        className="timer-input"
                        min="0"
                        max="59"
                    />
                ) : (
                    <span onClick={() => handleTimeClick('minutes')}>
                        {String(minutes).padStart(2, '0')}
                    </span>
                )}
                :
                {editingField === 'seconds' ? (
                <input
                        ref={inputRef}
                        type="number"
                        value={editValue}
                        onChange={handleTimeChange}
                        onKeyDown={handleInputKeyDown}
                        onBlur={saveNewTime}
                        className="timer-input"
                        min="0"
                        max="99"
                    />
                ) : (
                    <span onClick={() => handleTimeClick('seconds')}>
                        {String(seconds).padStart(2, '0')}
                    </span>
                )}
            </div>
            <div id="session-count">Session: {focusCount}</div>
            <div> {TrackFocus }</div>
            <button id="startStopBtn" onClick={startStop}>
                {isRunning ? "Stop" : "Start"}
            </button>
        </div>
    );
}

Timer.propTypes = {
    getSuggestions: PropTypes.func.isRequired
};

export const openTimer = () =>{
    document.querySelector('.Maintimer').style.display = 'flex';
}

export default Timer;