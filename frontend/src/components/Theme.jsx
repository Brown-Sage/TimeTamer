import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Theme.css";

// Placeholder backgrounds
const placeholderBgs = [
  { color: 'linear-gradient(to right, #f12711, #f5af19)' },
  { color: 'linear-gradient(to right, #4e54c8, #8f94fb)' },
  { color: 'linear-gradient(to right, #11998e, #38ef7d)' },
  { color: 'linear-gradient(to right, #ee0979, #ff6a00)' },
  { color: 'linear-gradient(to right, #8e2de2, #4a00e0)' },
  { color: 'linear-gradient(to right, #fc4a1a, #f7b733)' },
  { color: 'linear-gradient(to right, #00b09b, #96c93d)' },
  { color: 'linear-gradient(to right, #ad5389, #3c1053)' },
  { color: 'linear-gradient(to right, #667db6, #0082c8, #0082c8, #667db6)' },
  { color: 'linear-gradient(to right, #544a7d, #ffd452)' }
];

// Function to apply background to multiple elements for reliability
const applyBackgroundToElements = (bgValue, isImage = false) => {
  try {
    const value = isImage ? `url(${bgValue})` : bgValue;
    
    // Apply to multiple elements to ensure it works consistently
    // Apply to HTML element (most reliable for full page backgrounds)
    document.documentElement.style.background = value;
    document.documentElement.style.backgroundAttachment = 'fixed';
    document.documentElement.style.backgroundSize = 'cover';
    document.documentElement.style.backgroundPosition = 'center';
    
    // Apply to body as fallback
    document.body.style.background = 'transparent';
    
    // Also set a CSS variable that can be used in multiple places
    document.documentElement.style.setProperty('--app-background', value);
    
    // Add a class to the HTML element for additional styling hooks
    document.documentElement.classList.add('custom-background');
    
    console.log("Background applied successfully:", value);
    return true;
  } catch (error) {
    console.error("Error applying background:", error);
    return false;
  }
};

export default function Theme() {
  const [activeTab, setActiveTab] = useState('static');
  const navigate = useNavigate();

  // Use useEffect to make sure the background is not overridden
  useEffect(() => {
    // Set overflow hidden on body to prevent scrolling behind the modal
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    navigate('/');
  };

  const applyBackground = (bgColor) => {
    // Apply the background
    const success = applyBackgroundToElements(bgColor);
    
    if (success) {
      // Save the selection to localStorage
      try {
        localStorage.setItem('selectedBackground', bgColor);
        localStorage.removeItem('selectedBackgroundImage'); // Clear any previous image
        
        // Add a timestamp to track when it was last set
        localStorage.setItem('backgroundLastSet', Date.now().toString());
      } catch (e) {
        console.error("Error saving background to localStorage:", e);
      }
    }
    
    // Navigate back to home page after applying background
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        // File size check (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert("Image is too large. Please select an image under 10MB.");
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result;
          if (imageData) {
            // Apply the background with the image
            const success = applyBackgroundToElements(imageData, true);
            
            if (success) {
              // Save the image data to localStorage
              try {
                localStorage.setItem('selectedBackgroundImage', imageData.toString());
                localStorage.removeItem('selectedBackground'); // Clear any previous color/gradient
                
                // Add a timestamp to track when it was last set
                localStorage.setItem('backgroundLastSet', Date.now().toString());
              } catch (e) {
                console.error("Error saving background image to localStorage:", e);
                
                // If localStorage fails due to the image being too large, try storing just the fact that
                // we're using a custom image and keep it in memory
                localStorage.setItem('hasCustomBackground', 'true');
              }
            }
            
            // Navigate back to home page after applying background
            setTimeout(() => {
              navigate('/');
            }, 300);
          }
        };
        
        reader.onerror = () => {
          console.error("Error reading file");
          alert("There was a problem loading your image. Please try again.");
        };
        
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  
  return (
    <div className="theme-overlay">
      <div className="theme-modal">
        <div className="theme-header">
          <h2>Background Themes</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="theme-tabs">
          <button 
            className={`tab-btn ${activeTab === 'static' ? 'active' : ''}`}
            onClick={() => setActiveTab('static')}
          >
            Static Themes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live Themes
          </button>
        </div>

        <div className="theme-content">

          
          <div className="theme-grid">
            {placeholderBgs.slice(0, 5).map((bg, index) => (
              <div 
                key={`top-${index}`} 
                className="theme-item"
                onClick={() => applyBackground(bg.color)}
                style={{ background: bg.color }}
              />
            ))}
          </div>
          
          <div className="theme-grid">
            {placeholderBgs.slice(5, 10).map((bg, index) => (
              <div 
                key={`bottom-${index}`} 
                className="theme-item"
                onClick={() => applyBackground(bg.color)}
                style={{ background: bg.color }}
              />
            ))}
          </div>

          <div className="upload-container">
            <button onClick={handleFileUpload} className="upload-btn">
              Upload Custom Background
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}