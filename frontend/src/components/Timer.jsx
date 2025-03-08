import { useState, useEffect } from "react";
import "../styles/Timer.css";

function Timer() {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(50);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [mode , setMode] = useState('focus');
    const [focusCount, setFocusCount] = useState(0);
    const updateData = () => {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const startStop = () => {
        setIsRunning((prev) => !prev);
    };

    const handleBreak = () => {
        setIsRunning(true);
        setHours(0);
        setMinutes(0);
        setSeconds(5);
        setMode('break');
    };

    const handleFocus = () => {
        setIsRunning(true); // Start the timer when Focus is clicked
        setHours(0);
        setMinutes(0); // Reset to focus time (50 minutes)
        setSeconds(10);
        setMode('focus');
    };

    const handleLongBreak = () => {
        setIsRunning(true);
        setHours(0);
        setMinutes(0); // Set long break time (20 minutes)
        setSeconds(6);
        setMode('longbreak');
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
                <button onClick={handleFocus} className="child1">Focus</button>
                <button onClick={handleBreak} className="child1">Break</button>
                <button onClick={handleLongBreak} className="child1">Long Break</button>
            </div>
            <div id="timer">{updateData()}</div>
            <div id="session-count">Session: {Math.floor((focusCount % 4) + 1)}</div>
            <button id="startStopBtn" onClick={startStop}>
                {isRunning ? "Stop" : "Start"}
            </button>
        </>
    );
}

export default Timer;