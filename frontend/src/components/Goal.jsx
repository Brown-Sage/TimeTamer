import { useState, useEffect } from 'react';
import { IoMdAdd } from 'react-icons/io';
import { FaTrash } from 'react-icons/fa';
import '../styles/Goal.css';

function Goal() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [todayStats, setTodayStats] = useState({ completed: 0, total: 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  // Load tasks and calculate today's stats
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(savedTasks);
    updateTodayStats(savedTasks);
  }, []);

  // Update stats whenever tasks change
  useEffect(() => {
    updateTodayStats(tasks);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

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

  const updateTodayStats = (currentTasks) => {
    const today = new Date().toDateString();
    const todayTasks = currentTasks.filter(task => 
      new Date(task.id).toDateString() === today
    );
    const completed = todayTasks.filter(task => task.completed).length;
    setTodayStats({
      completed,
      total: todayTasks.length
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setNewTask(e.target.value);
  };

  // Add a new task
  const addTask = () => {
    if (newTask.trim() === '') return; // Prevent empty tasks
    const newTaskObject = { id: Date.now(), text: newTask, completed: false };
    setTasks((prevTasks) => [...prevTasks, newTaskObject]);
    setNewTask(''); // Clear input field
  };

  // Toggle task completion status
  const toggleTaskCompletion = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Delete a task
  const deleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  return (
    <div className={`task-manager ${isExpanded ? 'expanded' : ''}`} 
         onClick={() => setIsExpanded(true)}>
        <div className="minimized-view">
            TASK
        </div>
        
        <div className="expanded-view">
            <div className="task-header">
                <h2>Tasks</h2>
                <span className={`task-stats ${todayStats.completed === todayStats.total && todayStats.total > 0 ? 'completed' : 'pending'}`}>
                    ({todayStats.completed}/{todayStats.total})
                </span>
            </div>
            
            <div className="add-task">
                <input
                    type="text"
                    value={newTask}
                    onChange={handleInputChange}
                    placeholder="Add a new task"
                />
                <button onClick={addTask}><IoMdAdd /></button>
            </div>

            <ul className="task-list">
                {tasks.map((task, index) => (
                    <li key={index} className={task.completed ? 'completed' : ''}>
                        <div className="task-content">
                            <input 
                                type="checkbox"
                                className="task-checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskCompletion(task.id)}
                            />
                            <span>{task.text}</span>
                        </div>
                        <button onClick={() => deleteTask(task.id)}><FaTrash color='white' /></button>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
}

export default Goal;