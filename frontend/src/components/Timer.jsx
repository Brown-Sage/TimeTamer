import { useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import "../styles/Timer.css";
import WebcamDetector from "./WebcamDetector";
import "../styles/WebcamDetector.css";
import { useTimer } from "../context/TimerContext";
import PropTypes from "prop-types";

function Timer(props) {
    const { getSuggestions } = props;
    const {
        hours,
        minutes,
        seconds,
        isRunning,
        mode,
        focusCount,
        settings,
        isUserPresent,
        startStop,
        handleUserPresenceChange,
        handleSettingChange,
        handleFocus,
        handleBreak,
        handleLongBreak,
        setTimerSettings,
        setHours,
        setMinutes,
        setSeconds,
        timerSettings
    } = useTimer();

    const inputRef = useRef(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [showSettings, setShowSettings] = useState(false);

    const handleTimeClick = (field) => {
        if (!isRunning) {
            setEditingField(field);
            setEditValue(field === 'hours' ? hours.toString() : field === 'minutes' ? minutes.toString() : seconds.toString());
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
                        isEnabled={settings.webcamDetection}
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
                        max="59"
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

Timer.propTypes = {
    getSuggestions: PropTypes.func.isRequired
};

export default Timer;