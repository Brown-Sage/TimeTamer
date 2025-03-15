import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom"; 

const Container = styled("div")({
  backgroundColor: "#1a1a1a",
  padding: "20px",
  minHeight: "100vh",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
});

const Header = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
});

const StatsGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
  marginBottom: "20px",
});

const StatCard = styled(Card)({
  backgroundColor: "#2c2c2c",
  color: "#fff",
  textAlign: "center",
  padding: "16px",
  borderRadius: "12px",
});

const DayProgressCard = styled(Card)({
  backgroundColor: "#2c2c2c",
  color: "#fff",
  padding: "16px",
  borderRadius: "12px",
  marginBottom: "20px",
});

const ProgressBarContainer = styled("div")({
  margin: "16px 0",
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
        <Typography variant="h4" style={{ color: "#ff4d4d" }}>
          Streak <span role="img" aria-label="fire">🔥</span>
        </Typography>
        <div>
          <IconButton color="warning">
            <CloudOffIcon />
          </IconButton>
          <IconButton>
            <SettingsIcon />
          </IconButton>
        </div>
      </Header>

      <StatsGrid>
        <StatCard>
          <Typography variant="h6">Current Streak 😊</Typography>
          <Typography variant="h4">{currentStreak}</Typography>
        </StatCard>
        <StatCard>
          <Typography variant="h6">Best Record 🚀</Typography>
          <Typography variant="h4">{bestRecord}</Typography>
        </StatCard>
        <StatCard>
          <Typography variant="h6">Productive Days 🌟</Typography>
          <Typography variant="h4">{productiveDays}</Typography>
        </StatCard>
      </StatsGrid>

      <DayProgressCard>
        <Typography variant="h5">Your Day 🏃‍♂️</Typography>
        <Typography variant="body2" color="gray" style={{ marginBottom: "8px" }}>
          Last Streak Update: 2025-02-11 [Needs Repair]
        </Typography>

        <div>
          <Typography variant="body1">Day Progress 🌱</Typography>
          <ProgressBarContainer>
            <LinearProgress
              variant="determinate"
              value={dayProgress}
              color="success"
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#4a4a4a",
              }}
            />
            <Typography variant="body2" color="gray">
              {dayProgress}%
            </Typography>
          </ProgressBarContainer>

          <Typography variant="body1">Working Hours: {workingHours}</Typography>
          <Typography variant="body1">Time to Freedom: {timeToFreedom}</Typography>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
            <Typography variant="body2">Starts At</Typography>
            <Typography variant="body2">Ends At</Typography>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body1">{dayStart}</Typography>
            <Typography variant="body1">{dayEnd}</Typography>
          </div>
        </div>

        <IconButton
          color="primary"
          style={{ marginTop: "16px" }}
          aria-label="edit"
        >
          <SettingsIcon />
        </IconButton>
      </DayProgressCard>
    </Container>
  );
}

export default Stats;