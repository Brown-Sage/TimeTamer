import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import "../styles/Timer.css";
import alarmsound from "../assets/mixkit-clear-announce-tones-2861.wav";
import WebcamDetector from "./WebcamDetector";
import "../styles/WebcamDetector.css";
import axios from "axios";

function Timer() {
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

    const startStop = () => {
        setIsRunning((prev) => !prev);
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
        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem('timerSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setTimerSettings(settings);
            setMinutes(settings[mode].minutes);
        }
    }, []);

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
            }
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
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
    };

    const handleLongBreak = () => {
        setIsRunning(false);
        setMode('longbreak');
        setMinutes(timerSettings.longbreak.minutes);
        setSeconds(0);
        getSuggestions()
    };
    const playaudio = () =>{
        const audio = new Audio(alarmsound)
        audio.play().catch((error) => {
            console.error('Failed to play audio:', error);
        });
    };
    
     const getSuggestions = () => {
        console.log('login')
        const formData = new FormData()
        formData.append('user', "4ffb4ce7-19fb-4049-a908-0ecc639c9916")
        let user ="4ffb4ce7-19fb-4049-a908-0ecc639c9916"
        let url = `https://n8n.aitech.work/webhook-test/pomodoro/suggestions?user=${user}`
         
        axios
            .get(url)
            .then((resp) => {
                console.log("SUGGESTIONS RESP", resp)
            })
            .catch((err) => {
                console.log('sugges err', err)
            })
    }

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    const handleUserPresenceChange = (present) => {
        console.log('User presence changed:', present);
        setIsUserPresent(present);
        
        if (!present && settings.webcamDetection) {
            // Pause the timer if a user is not detected.
            if (isRunning) {
                setIsRunning(false);
            }
        }
        // No auto-resume when face is detected.
    };

    const handleSettingChange = (setting) => {
        setSettings(prev => {
            const newSettings = {
                ...prev,
                [setting]: !prev[setting]
            };
            localStorage.setItem(`timer${setting.charAt(0).toUpperCase() + setting.slice(1)}`, newSettings[setting]);
            return newSettings;
        });
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
                <button className="timer-control-btn" onClick={closeTimer}>
                    <IoClose size={18} />
                </button>
            </div>

            {showSettings && (
                <div className="timer-settings-menu">
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

            {settings.webcamDetection && (
                <WebcamDetector onUserPresenceChange={handleUserPresenceChange} />
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
export const openTimer = () =>{
    document.querySelector('.Maintimer').style.display = 'flex';
}

export default Timer;