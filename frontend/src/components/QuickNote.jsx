import { useState, useEffect } from 'react';
import { FaStickyNote, FaPlus, FaTrash, FaMinusCircle } from 'react-icons/fa';
import '../styles/QuickNote.css';

// Use a more unique key for localStorage
const STORAGE_KEY = 'timetamer_quick_notes';

export default function QuickNote() {
  const [isOpen, setIsOpen] = useState(true);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Load saved notes from localStorage when component mounts
  useEffect(() => {
    try {
      // Check all localStorage keys for debugging
      console.log('All localStorage keys:', Object.keys(localStorage));
      
      const savedNotes = localStorage.getItem(STORAGE_KEY);
      console.log('Loading notes from localStorage key:', STORAGE_KEY);
      console.log('Raw saved notes data:', savedNotes);
      
      if (savedNotes && savedNotes !== 'undefined' && savedNotes !== 'null') {
        try {
          const parsedNotes = JSON.parse(savedNotes);
          console.log('Successfully parsed notes:', parsedNotes);
          
          if (Array.isArray(parsedNotes)) {
            setNotes(parsedNotes);
            console.log('Notes loaded successfully');
          } else {
            console.error('Parsed notes is not an array:', parsedNotes);
            setNotes([]);
          }
        } catch (e) {
          console.error('Error parsing saved notes:', e);
          setNotes([]);
        }
      } else {
        console.log('No saved notes found or invalid data');
        setNotes([]);
      }
    } catch (e) {
      console.error('Error in loading effect:', e);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    // Only save after initial load to prevent overwriting with empty array
    if (loaded) {
      try {
        console.log('Saving notes to localStorage:', notes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        console.log('Save operation completed');
      } catch (e) {
        console.error('Error saving notes:', e);
      }
    }
  }, [notes, loaded]);

  // Force save notes - can be called before page unload or when needed
  const saveNotes = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      console.log('Notes manually saved to localStorage');
    } catch (e) {
      console.error('Error manually saving notes:', e);
    }
  };

  // Add window unload handler to ensure notes are saved when page refreshes
  useEffect(() => {
    if (!loaded) return; // Skip until initial load is complete
    
    const handleBeforeUnload = () => {
      saveNotes();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [notes, loaded]);

  const toggleNotes = () => {
    setIsOpen(!isOpen);
    // Save notes when toggling to ensure latest state is saved
    if (loaded) saveNotes();
  };

  const addNote = () => {
    if (newNote.trim()) {
      const newNoteObj = {
        id: Date.now(),
        text: newNote.trim(),
        timestamp: new Date().toLocaleString()
      };
      setNotes(prevNotes => {
        const updatedNotes = [...prevNotes, newNoteObj];
        // We don't need setTimeout here as the useEffect will handle saving
        return updatedNotes;
      });
      setNewNote('');
    }
  };

  const deleteNote = (id) => {
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.filter(note => note.id !== id);
      // We don't need setTimeout here as the useEffect will handle saving
      return updatedNotes;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addNote();
    }
  };

    return (
    <div className="quick-note-container">
      {!isOpen ? (
        <button className="quick-note-toggle" onClick={toggleNotes}>
          <FaStickyNote />
          <span>Notes</span>
        </button>
      ) : (
        <div className="quick-note-panel">
          <div className="quick-note-header">
            <h3>Quick Notes</h3>
            <button className="close-btn" onClick={toggleNotes} title="Minimize">
              <FaMinusCircle />
            </button>
          </div>
          
          <div className="quick-note-input">
            <input
              type="text"
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={addNote}>
              <FaPlus />
            </button>
          </div>
          
          <div className="quick-note-list">
            {notes.length === 0 ? (
              <p className="no-notes">No notes yet. Add your first task!</p>
            ) : (
              notes.map(note => (
                <div className="note-item" key={note.id}>
                  <p className="note-text">{note.text}</p>
                  <div className="note-footer">
                    <span className="note-timestamp">{note.timestamp}</span>
                    <button 
                      className="delete-btn" 
                      onClick={() => deleteNote(note.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}