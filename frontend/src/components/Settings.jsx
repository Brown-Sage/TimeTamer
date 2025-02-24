import "../styles/Settings.css";
import React, { useState } from "react";
import Switch from "react-switch";

export default function Settings() {
    const [switches, setSwitches] = useState({
        autoStartBreaks: false,
        autoStartPomodoros: false,
        longBreakInterval: false,
        autoCheckTasks: false,
        autoSwitchTasks: false
    });

    const handleChange = (key) => {
        setSwitches(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="setcontainer">
            <div className="alphaheader">
                <div className="bar">
                    <span className="setting"> SETTING </span>
                    <span className="x"> x </span>
                </div>
                
                <div className="timeoptions">
                    <div>
                        <span>Auto Start Breaks</span>
                        <span>
                            <Switch 
                                onChange={() => handleChange('autoStartBreaks')}
                                checked={switches.autoStartBreaks}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                onColor="#86d3ff"
                                offColor="#888888"
                            />
                        </span>
                    </div>
                    
                    <div>
                        <span>Auto Start Pomodoros</span>
                        <span>
                            <Switch 
                                onChange={() => handleChange('autoStartPomodoros')}
                                checked={switches.autoStartPomodoros}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                onColor="#86d3ff"
                                offColor="#888888"
                            />
                        </span>
                    </div>
                    
                    <div>
                        <span>Long break interval</span>
                        <span>
                            <Switch 
                                onChange={() => handleChange('longBreakInterval')}
                                checked={switches.longBreakInterval}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                onColor="#86d3ff"
                                offColor="#888888"
                            />
                        </span>
                    </div>
                </div>
                <div className="taskoptions">
                    <div>
                        <span>Auto Check Tasks</span>
                        <span>
                            <Switch 
                                onChange={() => handleChange('autoCheckTasks')}
                                checked={switches.autoCheckTasks}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                onColor="#86d3ff"
                                offColor="#888888"
                            />
                        </span>
                    </div>
                    
                    <div>
                        <span>Auto Switch Tasks</span>
                        <span>
                            <Switch 
                                onChange={() => handleChange('autoSwitchTasks')}
                                checked={switches.autoSwitchTasks}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                onColor="#86d3ff"
                                offColor="#888888"
                            />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
