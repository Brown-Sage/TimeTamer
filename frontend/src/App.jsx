import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home'
import Login from './components/Login'
import SignIn from './components/Signin'
import { ToastContainer } from 'react-toastify'
import Settings from './components/Settings'
import Stats from './components/Stats'
import Theme from './components/Theme'
import { useState, useEffect } from 'react';

// Enhanced function to load the saved background with error handling
const loadSavedBackground = () => {
  try {
    console.log("Attempting to load saved background...");
    
    // First check if we have a background image
    const savedBackgroundImage = localStorage.getItem('selectedBackgroundImage');
    if (savedBackgroundImage) {
      console.log("Found saved background image");
      
      // Apply to the HTML element for full page coverage
      document.documentElement.style.background = `url(${savedBackgroundImage})`;
      document.documentElement.style.backgroundAttachment = 'fixed';
      document.documentElement.style.backgroundSize = 'cover';
      document.documentElement.style.backgroundPosition = 'center';
      
      // Apply to body as transparent to show the HTML background
      document.body.style.background = 'transparent';
      
      // Set CSS variable for components to use
      document.documentElement.style.setProperty('--app-background', `url(${savedBackgroundImage})`);
      
      // Add a class for more styling hooks
      document.documentElement.classList.add('custom-background', 'image-background');
      
      return true;
    }
    
    // Check if there's a background color/gradient saved
    const savedBackground = localStorage.getItem('selectedBackground');
    if (savedBackground) {
      console.log("Found saved background gradient/color");
      
      // Apply to the HTML element
      document.documentElement.style.background = savedBackground;
      document.documentElement.style.backgroundAttachment = 'fixed';
      document.documentElement.style.backgroundSize = 'cover';
      
      // Apply to body as transparent to show the HTML background
      document.body.style.background = 'transparent';
      
      // Set CSS variable for components to use
      document.documentElement.style.setProperty('--app-background', savedBackground);
      
      // Add a class for more styling hooks
      document.documentElement.classList.add('custom-background', 'gradient-background');
      
      return true;
    }
    
    console.log("No saved background found, using default");
    return false;
  } catch (error) {
    console.error("Error loading saved background:", error);
    
    // Apply fallback background
    applyFallbackBackground();
    return false;
  }
};

// Fallback function if there's an error loading the saved background
const applyFallbackBackground = () => {
  try {
    const fallbackBg = 'linear-gradient(to bottom right, #1e293b, #0f172a)';
    document.documentElement.style.background = fallbackBg;
    document.documentElement.style.backgroundAttachment = 'fixed';
    document.documentElement.style.backgroundSize = 'cover';
    document.body.style.background = 'transparent';
    document.documentElement.style.setProperty('--app-background', fallbackBg);
  } catch (e) {
    console.error("Error applying fallback background:", e);
  }
};

// Create a wrapper component that will show the Theme component as an overlay
function AppContent() {
  const location = useLocation();
  const [showTheme, setShowTheme] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    // Load the saved background when the app starts (if not already loaded)
    if (!bgLoaded) {
      loadSavedBackground();
      setBgLoaded(true);
    }
    
    // Check if the current location includes /theme
    if (location.pathname === '/theme') {
      setShowTheme(true);
    } else {
      setShowTheme(false);
    }
  }, [location, bgLoaded]);

  // Periodically check if background needs to be reapplied
  useEffect(() => {
    // Function to check if background looks applied correctly
    const checkBackground = () => {
      const htmlBg = window.getComputedStyle(document.documentElement).background;
      if (htmlBg === 'none' || htmlBg === '') {
        console.log("Background appears to be missing, reapplying...");
        loadSavedBackground();
      }
    };
    
    // Check after component mounts and periodically
    const initialCheck = setTimeout(checkBackground, 1000);
    const intervalCheck = setInterval(checkBackground, 30000); // Check every 30 seconds
    
    return () => {
      clearTimeout(initialCheck);
      clearInterval(intervalCheck);
    };
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:username" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
      
      {showTheme && <Theme />}
      
      <ToastContainer
        position="top-right"
        theme="dark"
        autoClose={3000}
        closeOnClick={true}
        hideProgressBar
      />
    </>
  );
}

function App() {
  useEffect(() => {
    // Load the saved background when the app first mounts
    loadSavedBackground();
    
    // Add resize handler to make sure background stays properly sized
    const handleResize = () => {
      // Force a background refresh on resize
      const savedBg = localStorage.getItem('selectedBackground') || 
                      localStorage.getItem('selectedBackgroundImage');
      if (savedBg) {
        const style = document.documentElement.style;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App
