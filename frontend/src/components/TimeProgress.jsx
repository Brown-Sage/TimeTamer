import React, { useState, useEffect } from 'react';
import '../styles/TimeProgress.css';

const TimeProgress = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            
            // Calculate progress percentage through the day
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            const secondsInDay = 24 * 60 * 60;
            const secondsPassed = (now - startOfDay) / 1000;
            const progressPercent = (secondsPassed / secondsInDay) * 100;
            
            setProgress(progressPercent);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return {
            time: `${displayHours}:${String(minutes).padStart(2, '0')}`,
            period: period
        };
    };

    return (
        <div className="time-progress-container">
            <div className="time-info">
                <div 
                    className="current-time"
                    data-period={formatTime(currentTime).period}
                >
                    {formatTime(currentTime).time}
                </div>
                <div className="current-date">
                    {currentTime.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>
            <div className="progress-bar-container">
                <div 
                    className="progress-bar" 
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default TimeProgress;