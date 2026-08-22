import { useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import alarmSound from '../assets/mixkit-clear-announce-tones-2861.wav';
import { pushFocusSession } from '../lib/sync';
import { TimerContext } from './TimerContext';

const DEFAULT_TIMER_SETTINGS = {
    focus: { minutes: 50, seconds: 0 },
    break: { minutes: 5, seconds: 0 },
    longbreak: { minutes: 15, seconds: 0 }
};

const DEFAULT_PREFERENCES = {
    autoStartBreaks: true,
    autoStartPomodoros: false,
    longBreakInterval: true, // take a long break every 4th pomodoro
    autoCheckTasks: false,
    autoSwitchTasks: false
};

const playAlarm = () => {
    const audio = new Audio(alarmSound);
    audio.play().catch(console.error);
};

export function TimerProvider({ children }) {
    const [timerSettings, setTimerSettings] = useState(() => {
        const savedSettings = localStorage.getItem('timerSettings');
        return savedSettings ? JSON.parse(savedSettings) : DEFAULT_TIMER_SETTINGS;
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
    const [timerPreferences, setTimerPreferences] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('timerPreferences') || '{}');
            return { ...DEFAULT_PREFERENCES, ...saved };
        } catch {
            return { ...DEFAULT_PREFERENCES };
        }
    });
    const [isUserPresent, setIsUserPresent] = useState(true);

    // Refs mirror the latest state so a single stable interval can read
    // current values without being recreated every tick.
    const timeRef = useRef({ hours, minutes, seconds });
    timeRef.current = { hours, minutes, seconds };
    const metaRef = useRef({});
    metaRef.current = { mode, focusCount, settings, timerSettings, timerPreferences };

    // Setters and refs are stable, so these callbacks never change identity.
    const applyMode = useCallback((nextMode) => {
        const ts = metaRef.current.timerSettings;
        setMode(nextMode);
        setMinutes(ts[nextMode].minutes);
        setSeconds(0);
    }, []);

    // Persisted immediately; the periodic settings backup picks it up.
    const updatePreference = useCallback((key, value) => {
        setTimerPreferences(prev => {
            const next = { ...prev, [key]: Boolean(value) };
            localStorage.setItem('timerPreferences', JSON.stringify(next));
            return next;
        });
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

    const handleFocusSessionCompleted = useCallback(() => {
        const { focusCount: currentFocusCount, timerSettings: ts } = metaRef.current;
        const nextCount = currentFocusCount + 1;
        setFocusCount(nextCount);

        const completedAt = new Date().toISOString();
        const today = new Date(completedAt).toLocaleDateString();
        localStorage.setItem('focusSessionData', JSON.stringify({
            count: nextCount,
            lastUpdate: today
        }));

        const sessionMinutes = ts.focus.minutes;
        window.dispatchEvent(new CustomEvent('focusSessionCompleted', {
            detail: {
                minutes: sessionMinutes,
                timestamp: completedAt
            }
        }));

        const savedSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
        savedSessions.push({
            minutes: sessionMinutes,
            timestamp: completedAt
        });
        localStorage.setItem('focusSessions', JSON.stringify(savedSessions));

        // Best-effort server sync; offline stays local-only.
        pushFocusSession({ minutes: sessionMinutes, timestamp: completedAt });
    }, []);

    const completeSession = useCallback(() => {
        const {
            mode: currentMode,
            settings: currentSettings,
            focusCount: currentFocusCount,
            timerPreferences: prefs
        } = metaRef.current;

        setIsRunning(false);

        if (currentMode === 'focus') {
            if (currentSettings.alarm) playAlarm();
            handleFocusSessionCompleted();

            const useLongBreak = prefs.longBreakInterval && (currentFocusCount + 1) % 4 === 0;
            applyMode(useLongBreak ? 'longbreak' : 'break');
            if (prefs.autoStartBreaks) setIsRunning(true);
        } else {
            if (currentSettings.alarm) playAlarm();
            applyMode('focus');
            if (prefs.autoStartPomodoros) setIsRunning(true);
        }
    }, [applyMode, handleFocusSessionCompleted]);

    // Re-hydrate timer settings when settings are restored from the server
    // (fires on login on a fresh device).
    useEffect(() => {
        const handler = () => {
            try {
                const saved = localStorage.getItem('timerSettings');
                if (saved) setTimerSettings(JSON.parse(saved));
            } catch { /* corrupted value - keep current */ }
            setSettings({
                notifications: localStorage.getItem('timerNotifications') === 'true',
                alarm: localStorage.getItem('timerAlarm') === 'true',
                webcamDetection: localStorage.getItem('timerWebcamDetection') === 'true'
            });
            try {
                const savedPrefs = JSON.parse(localStorage.getItem('timerPreferences') || '{}');
                setTimerPreferences(prev => ({ ...prev, ...savedPrefs }));
            } catch { /* corrupted value - keep current */ }
        };
        window.addEventListener('timetamer:settings-synced', handler);
        return () => window.removeEventListener('timetamer:settings-synced', handler);
    }, []);

    // One interval for the whole run; per-tick values come from refs so this
    // effect only re-runs when the run state itself changes.
    useEffect(() => {
        if (!isRunning) return undefined;
        if (settings.webcamDetection && !isUserPresent) return undefined;

        const interval = setInterval(() => {
            const { hours: h, minutes: m, seconds: s } = timeRef.current;

            if (s > 0) {
                timeRef.current = { hours: h, minutes: m, seconds: s - 1 };
            } else if (m > 0) {
                timeRef.current = { hours: h, minutes: m - 1, seconds: 59 };
            } else if (h > 0) {
                timeRef.current = { hours: h - 1, minutes: 59, seconds: 0 };
            } else {
                completeSession();
                return;
            }

            setHours(timeRef.current.hours);
            setMinutes(timeRef.current.minutes);
            setSeconds(timeRef.current.seconds);
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, isUserPresent, settings.webcamDetection, completeSession]);

    const handleFocus = () => {
        setIsRunning(false);
        applyMode('focus');
    };

    const handleBreak = () => {
        setIsRunning(false);
        applyMode('break');
    };

    const handleLongBreak = () => {
        setIsRunning(false);
        applyMode('longbreak');
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
        timerPreferences,
        updatePreference,
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
