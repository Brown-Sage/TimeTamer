import "../styles/Settings.css";
import { useState } from "react";
import { Switch } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";
export default function Settings() {
    const navigate = useNavigate();
    const [switches, setSwitches] = useState({
        autoStartBreaks: true,
        autoStartPomodoros: false,
        longBreakInterval: false,
        autoCheckTasks: false,
        autoSwitchTasks: false
    });

    const handleChange = (key) => (event) => {
        setSwitches(prev => ({
            ...prev,
            [key]: event.target.checked
        }));
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
                                checked={switches.autoStartBreaks}
                                onChange={handleChange('autoStartBreaks')}
                                color="primary"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <span>Auto Start Pomodoros</span>
                        <div className="switch-container">
                            <Switch 
                                checked={switches.autoStartPomodoros}
                                onChange={handleChange('autoStartPomodoros')}
                                color="primary"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <span>Long break interval</span>
                        <div className="switch-container">
                            <Switch 
                                checked={switches.longBreakInterval}
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
                                checked={switches.autoCheckTasks}
                                onChange={handleChange('autoCheckTasks')}
                                color="primary"
                            />
                        </div>
                    </div>
                    <div>
                        <span>Auto Switch Tasks</span>
                        <div className="switch-container">
                            <Switch 
                                checked={switches.autoSwitchTasks}
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
