import React, { useState, useEffect } from "react";
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
            <div id="timer">{updateData()}</div>
            <button id="startStopBtn" onClick={startStop}>
                {isRunning ? "Stop" : "Start"}
            </button>
        </>
    );
}

export default Timer;