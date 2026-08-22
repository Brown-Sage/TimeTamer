import { styled, alpha } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import SettingsIcon from "@mui/icons-material/Settings";
import Lottie from "lottie-react";
import streakAnimation from "../assets/animations/streak.json";
import smileAnimation from "../assets/animations/smile.json";
import rocketAnimation from "../assets/animations/rocket.json";
import starAnimation from "../assets/animations/star.json";
import runnerAnimation from "../assets/animations/runner.json";
import plantAnimation from "../assets/animations/plant.json";
import { useEffect, useState, useCallback, useRef } from "react";
import { pullFocusSessions } from "../lib/sync";

const Container = styled("div")({
  backgroundColor: "transparent",
  padding: "36px 48px 60px",
  width: "100%",
  minHeight: "100vh",
  boxSizing: "border-box",
  color: "#f3eadd",
  fontFamily: "'Nunito Sans', sans-serif",
});

const Header = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "32px",
  paddingBottom: "16px",
  borderBottom: "1px solid rgba(255, 230, 200, 0.11)",
});

const StatsGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "24px",
  marginBottom: "32px",
});

const StatCard = styled(Card)({
  backgroundColor: "rgba(30, 25, 20, 0.6)",
  backdropFilter: "blur(22px) saturate(1.2)",
  WebkitBackdropFilter: "blur(22px) saturate(1.2)",
  color: "#f3eadd",
  textAlign: "center",
  padding: "24px",
  borderRadius: "26px",
  border: "1px solid rgba(255, 230, 200, 0.11)",
  boxShadow: "0 24px 48px -20px rgba(0, 0, 0, 0.6)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 32px 56px -22px rgba(0, 0, 0, 0.7)",
  },
});

const DayProgressCard = styled(Card)({
  backgroundColor: "rgba(30, 25, 20, 0.6)",
  backdropFilter: "blur(22px) saturate(1.2)",
  WebkitBackdropFilter: "blur(22px) saturate(1.2)",
  color: "#f3eadd",
  padding: "32px",
  borderRadius: "26px",
  border: "1px solid rgba(255, 230, 200, 0.11)",
  boxShadow: "0 24px 48px -20px rgba(0, 0, 0, 0.6)",
  "& h5": {
    marginBottom: "24px",
    fontWeight: "600",
    color: "#e29a63"
  },
  "& .day-status": {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "32px",
    padding: "8px 16px",
    backgroundColor: "rgba(255, 238, 216, 0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 230, 200, 0.08)",
    "& .status-indicator": {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "#a9c09c"
    }
  }
});

const ProgressBarContainer = styled("div")({
  margin: "24px 0",
  position: "relative",
  padding: "8px",
  backgroundColor: "rgba(0, 0, 0, 0.28)",
  borderRadius: "14px",
  border: "1px solid rgba(255, 230, 200, 0.08)",
  "& .MuiLinearProgress-root": {
    height: "12px",
    borderRadius: "6px",
    backgroundColor: "rgba(255, 238, 216, 0.1)",
    "& .MuiLinearProgress-bar": {
      borderRadius: "6px",
      background: "linear-gradient(90deg, #96b28a, #e29a63)"
    }
  },
  "& .progress-label": {
    position: "absolute",
    top: "-24px",
    right: "0",
    fontSize: "0.875rem",
    color: "#bcac97",
    fontWeight: "600"
  }
});

const TimeContainer = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "20px",
  marginTop: "32px",
  padding: "24px",
  backgroundColor: "rgba(0, 0, 0, 0.22)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 230, 200, 0.07)",
  boxShadow: "none"
});

const TimeItem = styled("div")({
  textAlign: "center",
  padding: "20px",
  backgroundColor: "rgba(255, 238, 216, 0.06)",
  borderRadius: "16px",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  border: "1px solid rgba(255, 230, 200, 0.08)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 16px 32px -14px rgba(0, 0, 0, 0.65)"
  },
  "& .label": {
    fontSize: "0.85rem",
    color: "#bcac97",
    marginBottom: "12px",
    fontWeight: "700",
    letterSpacing: "0.5px"
  },
  "& .value": {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#f3eadd"
  }
});

const LottieWrapper = styled('div')({
  width: "40px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "-4px",
  marginTop: "-4px"
});

function Stats() {
  // Clear existing localStorage data on mount
  useEffect(() => {
    localStorage.removeItem('currentStreak');
    localStorage.removeItem('bestRecord');
    localStorage.removeItem('productiveDays');
    localStorage.removeItem('lastStreakUpdate');
    localStorage.removeItem('completedFocusSessions');
  }, []);

  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestRecord, setBestRecord] = useState(0);
  const [productiveDays, setProductiveDays] = useState(0);
  const [lastStreakUpdate, setLastStreakUpdate] = useState(new Date().toLocaleDateString());
  const [completedFocusSessions, setCompletedFocusSessions] = useState(false);

  // Add state for focus time data with initial test data
  const [focusTimeData, setFocusTimeData] = useState(() => {
    const savedData = localStorage.getItem('focusTimeData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    // Generate last 7 days of empty data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: 0
      };
    });
    localStorage.setItem('focusTimeData', JSON.stringify(last7Days));
    return last7Days;
  });

  // Load data from local storage - REMOVED this effect since we want to start fresh
  // useEffect(() => {
  //   const savedStreak = localStorage.getItem("currentStreak");
  //   const savedBestRecord = localStorage.getItem("bestRecord");
  //   const savedProductiveDays = localStorage.getItem("productiveDays");
  //   const savedLastStreakUpdate = localStorage.getItem("lastStreakUpdate");
  //   const savedCompletedSessions = localStorage.getItem("completedFocusSessions");

  //   if (savedStreak) setCurrentStreak(parseInt(savedStreak, 10));
  //   if (savedBestRecord) setBestRecord(parseInt(savedBestRecord, 10));
  //   if (savedProductiveDays) setProductiveDays(parseInt(savedProductiveDays, 10));
  //   if (savedLastStreakUpdate) setLastStreakUpdate(savedLastStreakUpdate);
  //   if (savedCompletedSessions) setCompletedFocusSessions(savedCompletedSessions === 'true');
  // }, []);
  
  // Update data in local storage
  useEffect(() => {
    localStorage.setItem("currentStreak", currentStreak.toString());
    localStorage.setItem("bestRecord", bestRecord.toString());
    localStorage.setItem("productiveDays", productiveDays.toString());
    localStorage.setItem("lastStreakUpdate", lastStreakUpdate);
    localStorage.setItem("completedFocusSessions", completedFocusSessions.toString());
  }, [currentStreak, bestRecord, productiveDays, lastStreakUpdate, completedFocusSessions]);

  // Check for a new day and update streak accordingly
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    if (lastStreakUpdate !== today) {
      if (completedFocusSessions) {
        setCurrentStreak(prev => {
          const newStreak = prev + 1;
          // Only update best record if new streak is higher
          setBestRecord(prevBest => Math.max(prevBest, newStreak));
          // Only increment productive days if we completed sessions
          setProductiveDays(prevDays => prevDays + 1);
          return newStreak;
        });
      } else {
        // Reset streak to 0 if no sessions completed
        setCurrentStreak(0);
      }
      setLastStreakUpdate(today);
      setCompletedFocusSessions(false);
    }
  }, [lastStreakUpdate, completedFocusSessions]);

  // Function to calculate total focus time for today
  const calculateTodaysFocusTime = useCallback(() => {
    const savedSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
    const today = new Date().toLocaleDateString();
    const todaysSessions = savedSessions.filter(session =>
      new Date(session.timestamp).toLocaleDateString() === today
    );
    return todaysSessions.reduce((total, session) => total + session.minutes, 0);
  }, []);

  // Function to update focus time data
  const updateFocusTimeData = useCallback(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    setFocusTimeData(prevData => {
      let newData = [...prevData];
      const todayIndex = newData.findIndex(item => item.date === formattedDate);
      
      if (todayIndex >= 0) {
        newData[todayIndex] = {
          ...newData[todayIndex],
          time: calculateTodaysFocusTime()
        };
      } else {
        if (newData.length >= 7) {
          newData = newData.slice(1);
        }
        newData.push({ 
          date: formattedDate, 
          time: calculateTodaysFocusTime()
        });
      }
      
      localStorage.setItem('focusTimeData', JSON.stringify(newData));
      return newData;
    });
  }, [calculateTodaysFocusTime]);

  // Listen for focus session completion
  useEffect(() => {
    const handleFocusSessionCompleted = () => {
      setCompletedFocusSessions(true);
      const today = new Date().toLocaleDateString();

      // Only update streak if it's a new day
      if (lastStreakUpdate !== today) {
        setCurrentStreak(prev => {
          const newStreak = prev + 1;
          setBestRecord(prevBest => Math.max(prevBest, newStreak));
          setProductiveDays(prevDays => prevDays + 1);
          setLastStreakUpdate(today);
          return newStreak;
        });
      }

      // Update focus time data with the new session
      updateFocusTimeData();
    };

    window.addEventListener('focusSessionCompleted', handleFocusSessionCompleted);
    return () => {
      window.removeEventListener('focusSessionCompleted', handleFocusSessionCompleted);
    };
  }, [lastStreakUpdate, updateFocusTimeData]);

  // Initialize focus time data with any existing sessions
  const focusTimeDataRef = useRef(focusTimeData);
  focusTimeDataRef.current = focusTimeData;

  useEffect(() => {
    // Merge focus history saved on other devices first (no-op when offline)
    pullFocusSessions()
      .catch(() => {})
      .finally(() => {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

    // Generate last 7 days of data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      // If it's today, calculate total focus time
      if (dateStr === formattedDate) {
        return {
          date: dateStr,
          time: calculateTodaysFocusTime()
        };
      }

      // For past days, use existing data or 0
      const existingData = focusTimeDataRef.current.find(item => item.date === dateStr);
      return {
        date: dateStr,
        time: existingData ? existingData.time : 0
      };
    });

        setFocusTimeData(last7Days);
        localStorage.setItem('focusTimeData', JSON.stringify(last7Days));
      });
  }, [calculateTodaysFocusTime]);

  // Display Last streak update
  const lastUpdate = lastStreakUpdate ? new Date(lastStreakUpdate).toLocaleDateString(): new Date().toLocaleDateString()


  // Calculate day progress
  const calculateDayProgress = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    const totalDayDuration = endOfDay - startOfDay;
    const elapsedTime = now - startOfDay;
    const progress = Math.min(100, Math.round((elapsedTime / totalDayDuration) * 100));
    
    return progress;
  };

  const dayProgress = calculateDayProgress();
  
  // Calculate working hours and time to freedom
  const calculateTimeStats = () => {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59); // 11:59 PM
    
    const remainingWorkingHours = Math.max(0, endOfDay - now);
    const hoursRemaining = Math.floor(remainingWorkingHours / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((remainingWorkingHours % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      workingHours: "24 HR 0 MIN",
      timeToFreedom: `${hoursRemaining} HR ${minutesRemaining} MIN`,
      dayStart: "12:00 AM",
      dayEnd: "11:59 PM"
    };
  };

  const timeStats = calculateTimeStats();

  return (
    <Container>
      <Header>
        <Typography variant="h3" style={{
          color: "#e29a63",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          Statistics
          <LottieWrapper>
            <Lottie
              animationData={streakAnimation}
              loop={true}
              autoplay={true}
              style={{ 
                transform: "scale(2.5)",
                width: "100%", 
                height: "100%",
              }}
            />
          </LottieWrapper>
        </Typography>
        <div style={{ display: "flex", gap: "8px" }}>
          <IconButton 
            color="warning"
            sx={{
              backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.1),
              "&:hover": { backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.2) }
            }}
          >
            <CloudOffIcon />
          </IconButton>
          <IconButton
            sx={{
              backgroundColor: (theme) => alpha(theme.palette.common.white, 0.1),
              "&:hover": { 
                backgroundColor: (theme) => alpha(theme.palette.common.white, 0.2)
              }
            }}
          >
            <SettingsIcon />
          </IconButton>
        </div>
      </Header>

      <StatsGrid>
        <StatCard>
          <Typography variant="h6" style={{ 
            color: "#a9c09c", 
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            Current Streak
            <LottieWrapper>
              <Lottie
                animationData={smileAnimation}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </LottieWrapper>
          </Typography>
          <Typography variant="h3" style={{ fontWeight: "600" }}>
            {currentStreak}
          </Typography>
        </StatCard>
        <StatCard>
          <Typography variant="h6" style={{ 
            color: "#e29a63", 
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            Best Record
            <LottieWrapper>
              <Lottie
                animationData={rocketAnimation}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </LottieWrapper>
          </Typography>
          <Typography variant="h3" style={{ fontWeight: "600" }}>
            {bestRecord}
          </Typography>
        </StatCard>
        <StatCard>
          <Typography variant="h6" style={{ 
            color: "#e0b061", 
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            Productive Days
            <LottieWrapper>
              <Lottie
                animationData={starAnimation}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </LottieWrapper>
          </Typography>
          <Typography variant="h3" style={{ fontWeight: "600" }}>
            {productiveDays}
          </Typography>
        </StatCard>
      </StatsGrid>

      <DayProgressCard>
        <Typography variant="h5" style={{ 
          marginBottom: "8px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          Your Day
          <LottieWrapper>
            <Lottie
              animationData={runnerAnimation}
              loop={true}
              autoplay={true}
              style={{ width: "100%", height: "100%" }}
            />
          </LottieWrapper>
        </Typography>
        <Typography variant="body2" style={{
          color: "#bcac97",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          Last Streak Update: {lastUpdate}
          <span style={{ 
            color: "#e0896f",
            backgroundColor: "rgba(224, 137, 111, 0.14)",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.75rem"
          }}>
            Active
          </span>
        </Typography>

        <div>
          <Typography variant="h6" style={{ 
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            Day Progress
            <LottieWrapper style={{ width: "32px", height: "32px" }}>
              <Lottie
                animationData={plantAnimation}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </LottieWrapper>
          </Typography>
          <ProgressBarContainer>
            <Typography className="progress-label">
              {dayProgress}% Complete
            </Typography>
            <LinearProgress
              variant="determinate"
              value={dayProgress}
              color="success"
            />
          </ProgressBarContainer>

          <TimeContainer>
            <TimeItem>
              <Typography className="label">Working Hours</Typography>
              <Typography className="value">{timeStats.workingHours}</Typography>
            </TimeItem>
            <TimeItem>
              <Typography className="label">Time to Cook</Typography>
              <Typography className="value">{timeStats.timeToFreedom}</Typography>
            </TimeItem>
            <TimeItem>
              <Typography className="label">Starts At</Typography>
              <Typography className="value">{timeStats.dayStart}</Typography>
            </TimeItem>
            <TimeItem>
              <Typography className="label">Ends At</Typography>
              <Typography className="value">{timeStats.dayEnd}</Typography>
            </TimeItem>
          </TimeContainer>
        </div>

        <IconButton
          color="primary"
          style={{ 
            marginTop: "24px",
            backgroundColor: "rgba(226, 154, 99, 0.14)",
            "&:hover": { backgroundColor: "rgba(226, 154, 99, 0.24)" }
          }}
          aria-label="edit"
        >
          <SettingsIcon />
        </IconButton>
      </DayProgressCard>
    </Container>
  );
}

export default Stats;