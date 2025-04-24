import '../styles/Track.css'
import { styled, alpha } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useState, useEffect } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Container = styled("div")({
  padding: "36px 48px",
  color: "#fff",
  fontFamily: "Roboto, sans-serif",
  width: "100%",
  margin: "0 auto",
  boxSizing: "border-box"
});

const GraphCard = styled(Card)({
  backgroundColor: "rgba(44, 44, 44, 0.8)",
  color: "#fff",
  padding: "30px",
  borderRadius: "0",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderLeft: "none",
  borderRight: "none",
  marginBottom: "24px",
  height: "380px",
  boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.4)",
  }
});

const StatCard = styled(Card)({
  backgroundColor: "rgba(44, 44, 44, 0.8)",
  color: "#fff",
  textAlign: "center",
  padding: "30px 24px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  height: "100%",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.3)",
  }
});

const IconContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  margin: "0 auto 16px",
});

const HeaderSection = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "32px",
  padding: "0 8px 24px 8px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
});

export default function Track() {
  // State for focus time data
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

  // Calculate focus time statistics
  const [stats, setStats] = useState({
    todayMinutes: 0,
    totalMinutes: 0,
    dailyAverage: 0,
    bestDay: 0
  });

  // Function to calculate total focus time for today
  const calculateTodaysFocusTime = () => {
    const savedSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
    const today = new Date().toLocaleDateString();
    const todaysSessions = savedSessions.filter(session => 
      new Date(session.timestamp).toLocaleDateString() === today
    );
    return todaysSessions.reduce((total, session) => total + session.minutes, 0);
  };

  // Function to calculate stats
  const calculateStats = () => {
    const todayMinutes = calculateTodaysFocusTime();
    const totalMinutes = focusTimeData.reduce((sum, day) => sum + day.time, 0);
    const dailyAverage = Math.round(totalMinutes / focusTimeData.length);
    const bestDay = Math.max(...focusTimeData.map(day => day.time));

    setStats({
      todayMinutes,
      totalMinutes,
      dailyAverage,
      bestDay
    });
  };

  // Function to update focus time data
  const updateFocusTimeData = () => {
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
  };

  // Listen for focus session completion
  useEffect(() => {
    const handleFocusSessionCompleted = (event) => {
      console.log('Track: Focus session completed event received with data:', event.detail);
      // Update focus time data with the new session
      updateFocusTimeData();
    };

    window.addEventListener('focusSessionCompleted', handleFocusSessionCompleted);
    return () => {
      window.removeEventListener('focusSessionCompleted', handleFocusSessionCompleted);
    };
  }, []);

  // Initialize focus time data with any existing sessions
  useEffect(() => {
    updateFocusTimeData();
  }, []);

  // Update stats when focus time data changes
  useEffect(() => {
    calculateStats();
  }, [focusTimeData]);

  // Format minutes as hours and minutes
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Container className="track-container">
      <HeaderSection>
        <Typography variant="h4" style={{ 
          fontWeight: "600",
          color: "#81C784",
          letterSpacing: "0.5px"
        }}>
          Focus Analytics
        </Typography>
        <Typography variant="subtitle1" style={{ 
          color: "rgba(255, 255, 255, 0.6)",
          fontStyle: "italic"
        }}>
          Tracking your productivity journey
        </Typography>
      </HeaderSection>

      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <IconContainer sx={{ backgroundColor: alpha('#4CAF50', 0.2) }}>
              <AccessTimeIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
            </IconContainer>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, color: "rgba(255, 255, 255, 0.7)" }}>
              Today&apos;s Focus
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {formatTime(stats.todayMinutes)}
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <IconContainer sx={{ backgroundColor: alpha('#2196F3', 0.2) }}>
              <TrendingUpIcon sx={{ color: '#2196F3', fontSize: 28 }} />
            </IconContainer>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, color: "rgba(255, 255, 255, 0.7)" }}>
              Daily Average
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {formatTime(stats.dailyAverage)}
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <IconContainer sx={{ backgroundColor: alpha('#FFC107', 0.2) }}>
              <BarChartIcon sx={{ color: '#FFC107', fontSize: 28 }} />
            </IconContainer>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, color: "rgba(255, 255, 255, 0.7)" }}>
              Total Focus Time
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {formatTime(stats.totalMinutes)}
            </Typography>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <IconContainer sx={{ backgroundColor: alpha('#9C27B0', 0.2) }}>
              <EmojiEventsIcon sx={{ color: '#9C27B0', fontSize: 28 }} />
            </IconContainer>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, color: "rgba(255, 255, 255, 0.7)" }}>
              Best Day
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {formatTime(stats.bestDay)}
            </Typography>
          </StatCard>
        </Grid>
      </Grid>

      <GraphCard>
        <Typography variant="h6" style={{ 
          marginBottom: "20px",
          fontWeight: "500",
          color: "#81C784"
        }}>
          Daily Focus Time (last 7 days)
        </Typography>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart
            data={focusTimeData}
            margin={{ top: 10, right: 30, left: 5, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.1)"
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              stroke="#fff"
              tick={{ fill: '#fff', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
              dy={10}
            />
            <YAxis 
              stroke="#fff"
              tick={{ fill: '#fff', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
              tickFormatter={(value) => value === 0 ? '0' : `${value}m`}
              tickMargin={10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                fontSize: '14px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
              }}
              formatter={(value) => [`${formatTime(value)}`, 'Focus Time']}
              labelFormatter={(label) => `Date: ${label}`}
              cursor={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
              offset={20}
            />
            <Area 
              type="monotone" 
              dataKey="time" 
              stroke="#4CAF50" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTime)"
              activeDot={{ 
                r: 8,
                fill: '#fff',
                stroke: '#4CAF50',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </GraphCard>
    </Container>
  );
}

