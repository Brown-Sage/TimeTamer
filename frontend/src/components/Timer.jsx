import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import "../styles/Timer.css";
import alarmsound from "../assets/mixkit-clear-announce-tones-2861.wav";
import { AlarmSharp } from "@mui/icons-material";

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
    const [focusCount, setFocusCount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);
    const [editingField, setEditingField] = useState(null); // 'hours' or 'minutes'
    const [editValue, setEditValue] = useState("");
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        notifications: localStorage.getItem('timerNotifications') === 'true',
        alarm: localStorage.getItem('timerAlarm') === 'true'
    });

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
        else if (editingField === 'seconds') {
            const newSeconds = Math.min(Math.max(value, 0), 59);
            setSeconds(newSeconds);
        }
        setEditingField(null);
    };

    useEffect(() => {
        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem('timerSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setTimerSettings(settings);
            setMinutes(settings[mode].minutes);
        }
    }, []);

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
    };
    const playaudio = () =>{
        const audio = new Audio(alarmsound)
        audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
    });
};
    

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {        // Timer does not update after 1st session it stays 00, gotta fix that
                setSeconds((prevSeconds) => {
                    if (prevSeconds === 0) {
                        if (minutes === 0) {
                            if (hours === 0) {
                                clearInterval(interval);
                                setIsRunning(false);
                                if(mode === 'focus'){
                                    // Only increment focus count when focus session completes
                                    if(settings.alarm) playaudio();
                                    const nextCount = focusCount + 1;
                                    setFocusCount(nextCount);
                                    
                                    // Ditermine next break type based on new count
                                    if (nextCount % 4 === 0) {
                                        handleLongBreak();
                                    } else {
                                        handleBreak();
                                    }
                                } else if(mode === 'break' || mode === 'longbreak'){
                                    if(settings.alarm) playaudio();
                                    handleFocus();
                                }
                                return 0;
                            } else {
                                setHours((prevHours) => prevHours - 1);
                                setMinutes(59);
                                return 0;
                            }
                        } else {
                            setMinutes((prevMinutes) => prevMinutes - 1);
                            return 59;
                        }
                    }
                    return prevSeconds - 1;
                });
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRunning, minutes, seconds, hours, mode, focusCount, settings.alarm]);

    const toggleSettings = () => {
        setShowSettings(!showSettings);
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
        // Add any cleanup logic here
        setIsRunning(false);
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
            <button id="startStopBtn" onClick={startStop}>
                {isRunning ? "Stop" : "Start"}
            </button>
        </div>
    );
}

export default Timer;