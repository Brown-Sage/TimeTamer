import { useState, useEffect, useRef } from "react";
import "../styles/Timer.css";

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

    const updateData = () => {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const startStop = () => {
        setIsRunning((prev) => !prev);
    };

    const handleTimeClick = (field) => {
        if (!isRunning) {
            setEditingField(field);
            setEditValue(field === 'hours' ? hours.toString() : minutes.toString());
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
        } else {
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

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds((prevSeconds) => {
                    if (prevSeconds === 0) {
                        if (minutes === 0) {
                            if (hours === 0) {
                                clearInterval(interval);
                                setIsRunning(false);
                                if(mode === 'focus'){
                                    setFocusCount(prev => {
                                        const newCount = prev+1;
                                        if (newCount % 4 === 0){
                                            handleLongBreak();
                                        }
                                        else{
                                            handleBreak();
                                        }
                                        return newCount;
                                    })
                                }
                                    else if(mode === 'break' || mode == 'longbreak'){{
                                        handleFocus();
                                    }
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
    }, [isRunning, minutes, seconds, hours]);

    return (
        <>
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
                :{String(seconds).padStart(2, '0')}
            </div>
            <div id="session-count">Session: {Math.floor((focusCount % 4) + 1)}</div>
            <button id="startStopBtn" onClick={startStop}>
                {isRunning ? "Stop" : "Start"}
            </button>
        </>
    );
}

export default Timer;