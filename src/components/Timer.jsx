import { useState, useEffect } from "react";
import "../styles/Timer.css";

function Timer() {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(50);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const updateData = () => {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const startStop = () => {
        setIsRunning((prev) => !prev);
    };

    const handleBreak = () => {
        setIsRunning(false);
        setHours(0);
        setMinutes(10);
        setSeconds(0);
    };

    const handleFocus = () => {
        setIsRunning(false); // Start the timer when Focus is clicked
        setHours(0);
        setMinutes(50); // Reset to focus time (50 minutes)
        setSeconds(0);
    };

    const handleLongBreak = () => {
        setIsRunning(false);
        setHours(0);
        setMinutes(20); // Set long break time (20 minutes)
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
                                alert("Pomodoro timer finished!");
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
            <button id="startStopBtn" onClick={startStop}>
                {isRunning ? "Stop" : "Start"}
            </button>
        </>
    );
}

export default Timer;