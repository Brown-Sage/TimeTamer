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
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      period
    };
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });
  };

  const formattedTime = formatTime(currentTime);

  return (
    <div className="time-progress-container">
      <div className="time-info">
        <div className="time-display">
          <span className="current-time">
            {formattedTime.hours}:{formattedTime.minutes}:{formattedTime.seconds}
          </span>
          <span className="current-period">{formattedTime.period}</span>
        </div>
        <div className="current-date">
          {formatDate(currentTime)}
        </div>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default TimeProgress;