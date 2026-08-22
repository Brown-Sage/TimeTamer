import { useState, useEffect, useRef } from 'react';
import { FaStickyNote, FaPlus, FaTrash, FaMinusCircle } from 'react-icons/fa';
import '../styles/QuickNote.css';
import { useAuth } from '../context/AuthContext';
import { pullNotes, pushNotes } from '../lib/sync';

// Use a more unique key for localStorage
const STORAGE_KEY = 'timetamer_quick_notes';

export default function QuickNote() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [notes, setNotes] = useState(() => {
    try {
      const savedNotes = localStorage.getItem(STORAGE_KEY);
      if (!savedNotes || savedNotes === 'undefined' || savedNotes === 'null') return [];
      const parsed = JSON.parse(savedNotes);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error loading notes:', e);
      return [];
    }
  });
  const [newNote, setNewNote] = useState('');
  const pushTimer = useRef(null);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving notes:', e);
    }
  }, [notes]);

  // Pull server-side notes after login, then mirror changes with a
  // debounced whole-array push (same pattern as tasks).
  const syncedOnce = useRef(false);
  useEffect(() => {
    if (!user) { syncedOnce.current = false; return undefined; }
    let cancelled = false;
    pullNotes().then((merged) => {
      if (!cancelled && Array.isArray(merged)) {
        setNotes(merged);
        syncedOnce.current = true;
      }
    });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user || !syncedOnce.current) return undefined;
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => pushNotes(notes), 800);
    return () => clearTimeout(pushTimer.current);
  }, [notes, user]);

  const toggleNotes = () => {
    setIsOpen(!isOpen);
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