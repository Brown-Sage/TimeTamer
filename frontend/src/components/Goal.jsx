import { useState, useEffect } from 'react';
import { IoMdAdd } from 'react-icons/io';
import { FaTrash } from 'react-icons/fa';
import '../styles/Goal.css';
import alarmsound from "../assets/mixkit-clear-announce-tones-2861.wav";

function Goal() {
  // Initialize tasks from localStorage
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [todayStats, setTodayStats] = useState({ completed: 0, total: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [taskDuration, setTaskDuration] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [, setTimerUpdate] = useState(0);
  const [settings, setSettings] = useState({
    alarm: localStorage.getItem('goalAlarm') === 'true' || true, // Default to true if not set
  });
  const [showSettings, setShowSettings] = useState(false);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTodayStats(tasks);
  }, [tasks]);

  // Timer update effect
  useEffect(() => {
    const hasRunningTasks = tasks.some(task => task.isRunning);
    if (!hasRunningTasks) return;

    const interval = setInterval(() => {
      setTimerUpdate(prev => prev + 1);
      // Save current state of running tasks
      setTasks(currentTasks => {
        const updatedTasks = currentTasks.map(task => {
          if (task.isRunning) {
            const elapsedMinutes = task.startTime 
              ? (Date.now() - task.startTime) / (60 * 1000)
              : task.elapsedTime;
              
            // Check if timer has just finished
            if (task.duration > 0 && task.duration - elapsedMinutes <= 0) {
              // Play alarm sound when timer finishes
              if (settings.alarm) playaudio();
              return { 
                ...task, 
                isRunning: false, 
                elapsedTime: task.duration 
              };
            }
            
            return { ...task, elapsedTime: elapsedMinutes };
          }
          return task;
        });
        return updatedTasks;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks, settings.alarm]);

  // Update stats whenever tasks change
  const updateTodayStats = (currentTasks) => {
    const today = new Date().toLocaleDateString();
    const todayTasks = currentTasks.filter(task => 
      new Date(task.createdAt).toLocaleDateString() === today
    );
    const completed = todayTasks.filter(task => task.completed).length;
    setTodayStats({
      completed,
      total: todayTasks.length
    });
  };

  // Add click handler for outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && !event.target.closest('.task-manager')) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Handle input changes
  const handleInputChange = (e) => {
    setNewTask(e.target.value);
  };

  // Add a new task
  const addTask = () => {
    if (newTask.trim() === '') return;
    const newTaskObject = { 
      id: Date.now(), 
      text: newTask, 
      completed: false,
      duration: parseInt(taskDuration) || 0,
      startTime: null,
      isRunning: false,
      priority: taskPriority,
      elapsedTime: 0,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTaskObject];
      return updatedTasks;
    });
    setNewTask('');
    setTaskDuration('');
    setTaskPriority('medium');
  };

  // Toggle task completion status
  const toggleTaskCompletion = (id) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === id) {
          const wasRunning = task.isRunning;
          
          // If task is being completed and was running with a timer, play alarm sound
          if (!task.completed && wasRunning && settings.alarm) {
            playaudio();
          }
          
          return { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : null,
            isRunning: false, // Stop the timer if it was running
            elapsedTime: task.isRunning ? 
              (Date.now() - task.startTime) / (60 * 1000) : 
              task.elapsedTime
          };
        }
        return task;
      })
    );
  };

  // Delete a task
  const deleteTask = (id) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  // Start timer for a task
  const startTaskTimer = (id) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id 
          ? { ...task, startTime: Date.now() - (task.elapsedTime * 60 * 1000), isRunning: true }
          : task
      )
    );
  };

  // Stop timer for a task
  const stopTaskTimer = (id) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === id) {
          const elapsedMinutes = task.startTime 
            ? (Date.now() - task.startTime) / (60 * 1000)
            : task.elapsedTime;
          return {
            ...task,
            isRunning: false,
            elapsedTime: elapsedMinutes
          };
        }
        return task;
      })
    );
  };

  // Calculate remaining time for a task
  const getRemainingTime = (task) => {
    if (!task.startTime || !task.isRunning) {
      return task.duration - task.elapsedTime;
    }
    const elapsed = (Date.now() - task.startTime) / 1000; // Convert to seconds
    const remainingMinutes = Math.max(0, task.duration - (elapsed / 60));
    return remainingMinutes;
  };

  // Format time in minutes to MM:SS
  const formatTime = (minutes) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if timer is finished
  const isTimerFinished = (task) => {
    if (!task.isRunning) return false;
    return getRemainingTime(task) <= 0;
  };

  // Play alarm sound
  const playaudio = () => {
    const audio = new Audio(alarmsound);
    audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
    });
  };

  // Sort tasks by priority and date
  const getSortedTasks = () => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const today = new Date().toLocaleDateString();
    
    return [...tasks]
      .filter(task => new Date(task.createdAt).toLocaleDateString() === today)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  };

  // Handle setting change
  const handleSettingChange = (setting) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [setting]: !prev[setting]
      };
      
      localStorage.setItem(`goal${setting.charAt(0).toUpperCase() + setting.slice(1)}`, newSettings[setting]);
      return newSettings;
    });
  };

  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className={`task-manager ${isExpanded ? 'expanded' : ''}`} 
         onClick={() => setIsExpanded(true)}>
        <div className="minimized-view">
            Tasks
        </div>
        
        <div className="expanded-view">
            <div className="task-header">
                <h2>Today&apos;s Tasks</h2>
                <span className={`task-stats ${todayStats.completed === todayStats.total && todayStats.total > 0 ? 'completed' : 'pending'}`}>
                    ({todayStats.completed}/{todayStats.total})
                </span>
                <button className="settings-button" onClick={(e) => { e.stopPropagation(); toggleSettings(); }}>
                    ⚙️
                </button>
            </div>
            
            {showSettings && (
                <div className="task-settings-menu">
                    <h3 className="settings-title">Task Settings</h3>
                    <div className="settings-option">
                        <input
                            type="checkbox"
                            id="goal-alarm"
                            checked={settings.alarm}
                            onChange={() => handleSettingChange('alarm')}
                        />
                        <label htmlFor="goal-alarm">Enable alarm sound</label>
                    </div>
                </div>
            )}
            
            <div className="add-task">
                <input
                    type="text"
                    value={newTask}
                    onChange={handleInputChange}
                    placeholder="Add a new task"
                />
                <input
                    type="number"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(e.target.value)}
                    placeholder="Minutes"
                    min="1"
                    className="duration-input"
                />
                <select 
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="priority-select"
                >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <button onClick={addTask}><IoMdAdd /></button>
            </div>

            <ul className="task-list">
                {getSortedTasks().map((task) => (
                    <li key={task.id} className={`${task.completed ? 'completed' : ''} priority-${task.priority}`}>
                        <div className="task-content">
                            <input 
                                type="checkbox"
                                className="task-checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskCompletion(task.id)}
                            />
                            <div className="task-details">
                                <div className="task-header-row">
                                    <span className="task-text">{task.text}</span>
                                    <span className={`priority-badge ${task.priority}`}>
                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                </div>
                                <div className="task-timer">
                                    <span className="task-duration">
                                        {task.duration} min
                                    </span>
                                    {task.duration > 0 && (
                                        <>
                                            <span className={`timer-display ${isTimerFinished(task) ? 'finished' : ''}`}>
                                                {formatTime(getRemainingTime(task))}
                                            </span>
                                            {!task.completed && (
                                                <button 
                                                    className={`timer-button ${task.isRunning ? 'stop' : 'start'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        task.isRunning ? stopTaskTimer(task.id) : startTaskTimer(task.id);
                                                    }}
                                                >
                                                    {task.isRunning ? 'Stop' : 'Start'}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                                {task.completed && (
                                    <div className="task-completion-time">
                                        Completed at: {new Date(task.completedAt).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={() => deleteTask(task.id)}><FaTrash color="white" /></button>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
}

export default Goal;