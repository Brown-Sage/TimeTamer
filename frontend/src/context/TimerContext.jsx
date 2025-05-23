import { createContext, useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const TimerContext = createContext();

export function TimerProvider({ children }) {
    const [timerSettings, setTimerSettings] = useState(() => {
        const savedSettings = localStorage.getItem('timerSettings');
        return savedSettings ? JSON.parse(savedSettings) : {
            focus: { minutes: 50, seconds: 0 },
            break: { minutes: 5, seconds: 0 },
            longbreak: { minutes: 15, seconds: 0 }
        };
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
    const [settings, setSettings] = useState({
        notifications: localStorage.getItem('timerNotifications') === 'true',
        alarm: localStorage.getItem('timerAlarm') === 'true',
        webcamDetection: localStorage.getItem('timerWebcamDetection') === 'true'
    });
    const [isUserPresent, setIsUserPresent] = useState(true);
    const timerIntervalRef = useRef(null);

    // Load saved settings from localStorage on initial mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('timerSettings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            setTimerSettings(parsedSettings);
            setMinutes(parsedSettings[mode].minutes);
        }
    }, []);

    const startStop = () => {
        setIsRunning((prev) => !prev);
    };

    const handleUserPresenceChange = (present) => {
        const wasPaused = !isRunning && !isUserPresent;
        setIsUserPresent(present);
        
        if (present && settings.webcamDetection) {
            if (wasPaused) {
                setTimeout(() => {
                    setIsRunning(true);
                }, 100);
            }
        } else if (!present && settings.webcamDetection && isRunning) {
            setIsRunning(false);
        }
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

    const handleFocusSessionCompleted = () => {
        const nextCount = focusCount + 1;
        setFocusCount(nextCount);
        
        const today = new Date().toLocaleDateString();
        localStorage.setItem('focusSessionData', JSON.stringify({
            count: nextCount,
            lastUpdate: today
        }));

        const sessionMinutes = timerSettings.focus.minutes;
        const sessionCompletedEvent = new CustomEvent('focusSessionCompleted', {
            detail: {
                minutes: sessionMinutes,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(sessionCompletedEvent);
        
        const savedSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
        savedSessions.push({
            minutes: sessionMinutes,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('focusSessions', JSON.stringify(savedSessions));
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
                                        if(settings.alarm) {
                                            const audio = new Audio('/src/assets/mixkit-clear-announce-tones-2861.wav');
                                            audio.play().catch(console.error);
                                        }
                                        handleFocusSessionCompleted();
                                        
                                        if ((focusCount + 1) % 4 === 0) {
                                            handleLongBreak();
                                        } else {
                                            handleBreak();
                                        }
                                    } else if(mode === 'break' || mode === 'longbreak'){
                                        if(settings.alarm) {
                                            const audio = new Audio('/src/assets/mixkit-clear-announce-tones-2861.wav');
                                            audio.play().catch(console.error);
                                        }
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
    };

    const handleLongBreak = () => {
        setIsRunning(false);
        setMode('longbreak');
        setMinutes(timerSettings.longbreak.minutes);
        setSeconds(0);
    };

    const value = {
        timerSettings,
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
        setSeconds
    };

    return (
        <TimerContext.Provider value={value}>
            {children}
        </TimerContext.Provider>
    );
}

TimerProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export function useTimer() {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
} 