import { styled } from "@mui/material/styles";
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

const Container = styled("div")({
  backgroundColor: "rgba(26, 26, 26, 0.95)",
  padding: "10px",
  width: "98.8vw",
  height: "97.6vh",
  color: "#fff",
  fontFamily: "Roboto, sans-serif",
  
});

const Header = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "32px",
  paddingBottom: "16px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
});

const StatsGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "24px",
  marginBottom: "32px",
});

const StatCard = styled(Card)({
  backgroundColor: "rgba(44, 44, 44, 0.8)",
  color: "#fff",
  textAlign: "center",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
  },
});

const DayProgressCard = styled(Card)({
  backgroundColor: "rgba(44, 44, 44, 0.8)",
  color: "#fff",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
});

const ProgressBarContainer = styled("div")({
  margin: "24px 0",
  position: "relative",
  "& .MuiLinearProgress-root": {
    height: "16px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    "& .MuiLinearProgress-bar": {
      borderRadius: "8px",
      background: "linear-gradient(90deg, #4CAF50, #8BC34A)",
    },
  },
  "& .progress-label": {
    position: "absolute",
    top: "-24px",
    right: "0",
    fontSize: "0.875rem",
    color: "rgba(255, 255, 255, 0.7)",
  },
});

const TimeContainer = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "20px",
  marginTop: "32px",
  padding: "20px",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
});

const TimeItem = styled("div")({
  textAlign: "center",
  padding: "12px",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderRadius: "8px",
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
  },
  "& .label": {
    fontSize: "0.875rem",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: "8px",
  },
  "& .value": {
    fontSize: "1.25rem",
    fontWeight: "500",
    color: "#fff",
  },
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
  const currentStreak = 4;
  const bestRecord = 10;
  const productiveDays = 37;
  
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
          color: "#ff4d4d",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          Streak 
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
              backgroundColor: "rgba(255, 152, 0, 0.1)",
              "&:hover": { backgroundColor: "rgba(255, 152, 0, 0.2)" }
            }}
          >
            <CloudOffIcon />
          </IconButton>
          <IconButton
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" }
            }}
          >
            <SettingsIcon />
          </IconButton>
        </div>
      </Header>

      <StatsGrid>
        <StatCard>
          <Typography variant="h6" style={{ 
            color: "#4CAF50", 
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
            color: "#2196F3", 
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
            color: "#FFC107", 
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
          color: "rgba(255, 255, 255, 0.7)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          Last Streak Update: {new Date().toLocaleDateString()}
          <span style={{ 
            color: "#ff4d4d",
            backgroundColor: "rgba(255, 77, 77, 0.1)",
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
            backgroundColor: "rgba(33, 150, 243, 0.1)",
            "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.2)" }
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