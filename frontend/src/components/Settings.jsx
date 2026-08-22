import "../styles/Settings.css";
import { Switch } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";
import { useTimer } from "../context/TimerContext";

export default function Settings() {
    const navigate = useNavigate();
    const { timerPreferences, updatePreference } = useTimer();

    const handleChange = (key) => (event) => {
        updatePreference(key, event.target.checked);
    };

    return (
        <div className="setcontainer">
            <div className="alphaheader">
                <div className="bar">
                    <span className="setting"> SETTING </span>
                    <button onClick={() => navigate("/")} className="x"> <CloseIcon /> </button>
                </div>
                
                <div className="timeoptions">
                    <div>
                        <span>Auto Start Breaks</span>
                        <div className="switch-container">
                            <Switch 
                                checked={timerPreferences.autoStartBreaks}
                                onChange={handleChange('autoStartBreaks')}
                                color="primary"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <span>Auto Start Pomodoros</span>
                        <div className="switch-container">
                            <Switch 
                                checked={timerPreferences.autoStartPomodoros}
                                onChange={handleChange('autoStartPomodoros')}
                                color="primary"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <span>Long break interval</span>
                        <div className="switch-container">
                            <Switch 
                                checked={timerPreferences.longBreakInterval}
                                onChange={handleChange('longBreakInterval')}
                                color="primary"
                            />
                        </div>
                    </div>
                </div>
                <div className="taskoptions">
                    <div>
                        <span>Auto Check Tasks</span>
                        <div className="switch-container">
                            <Switch 
                                checked={timerPreferences.autoCheckTasks}
                                onChange={handleChange('autoCheckTasks')}
                                color="primary"
                            />
                        </div>
                    </div>
                    <div>
                        <span>Auto Switch Tasks</span>
                        <div className="switch-container">
                            <Switch 
                                checked={timerPreferences.autoSwitchTasks}
                                onChange={handleChange('autoSwitchTasks')}
                                color="primary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
