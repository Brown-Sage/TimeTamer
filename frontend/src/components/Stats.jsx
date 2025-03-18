import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom"; 

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
});

const ProgressBarContainer = styled("div")({
  margin: "24px 0",
  "& .MuiLinearProgress-root": {
    height: "12px",
    borderRadius: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    "& .MuiLinearProgress-bar": {
      borderRadius: "6px",
    },
  },
});

const TimeContainer = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
  marginTop: "24px",
  padding: "16px",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  borderRadius: "12px",
});

const TimeItem = styled("div")({
  textAlign: "center",
  "& .label": {
    fontSize: "0.875rem",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: "4px",
  },
  "& .value": {
    fontSize: "1.25rem",
    fontWeight: "500",
  },
});

function Stats() {
  const navigate = useNavigate();
  const currentStreak = 4;
  const bestRecord = 10;
  const productiveDays = 37;
  const dayProgress = 58;
  const workingHours = "23 HR 59 MIN";
  const timeToFreedom = "10 HR 8 MIN";
  const dayStart = "00:00";
  const dayEnd = "23:59";

  return (
    <Container>
      <Header>
        <Typography variant="h4" style={{ 
          color: "#ff4d4d",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          Streak <span role="img" aria-label="fire">🔥</span>
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
          <Typography variant="h6" style={{ color: "#4CAF50", marginBottom: "16px" }}>
            Current Streak 😊
          </Typography>
          <Typography variant="h3" style={{ fontWeight: "600" }}>
            {currentStreak}
          </Typography>
        </StatCard>
        <StatCard>
          <Typography variant="h6" style={{ color: "#2196F3", marginBottom: "16px" }}>
            Best Record 🚀
          </Typography>
          <Typography variant="h3" style={{ fontWeight: "600" }}>
            {bestRecord}
          </Typography>
        </StatCard>
        <StatCard>
          <Typography variant="h6" style={{ color: "#FFC107", marginBottom: "16px" }}>
            Productive Days 🌟
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
          Your Day 🏃‍♂️
        </Typography>
        <Typography variant="body2" style={{ 
          color: "rgba(255, 255, 255, 0.7)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          Last Streak Update: 2025-02-11 
          <span style={{ 
            color: "#ff4d4d",
            backgroundColor: "rgba(255, 77, 77, 0.1)",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.75rem"
          }}>
            Needs Repair
          </span>
        </Typography>

        <div>
          <Typography variant="h6" style={{ marginBottom: "16px" }}>
            Day Progress 🌱
          </Typography>
          <ProgressBarContainer>
            <LinearProgress
              variant="determinate"
              value={dayProgress}
              color="success"
            />
            <Typography variant="body1" style={{ 
              marginTop: "8px",
              color: "#4CAF50",
              fontWeight: "500"
            }}>
              {dayProgress}% Complete
            </Typography>
          </ProgressBarContainer>

          <TimeContainer>
            <TimeItem>
              <Typography className="label">Working Hours</Typography>
              <Typography className="value">{workingHours}</Typography>
            </TimeItem>
            <TimeItem>
              <Typography className="label">Time to Freedom</Typography>
              <Typography className="value">{timeToFreedom}</Typography>
            </TimeItem>
            <TimeItem>
              <Typography className="label">Starts At</Typography>
              <Typography className="value">{dayStart}</Typography>
            </TimeItem>
            <TimeItem>
              <Typography className="label">Ends At</Typography>
              <Typography className="value">{dayEnd}</Typography>
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