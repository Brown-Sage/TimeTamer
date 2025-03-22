import { useState } from "react";
import PropTypes from 'prop-types';
import { MdOutlineOpenInFull, MdOutlineCloseFullscreen } from "react-icons/md";
import "../styles/SpotifyFrame.css";

const SpotifyFrame = ({ playlistId }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div className={`spotify-container ${isMaximized ? 'maximized' : ''}`}>
      <div className="spotify-header">
        <button 
          className="maximize-button"
          onClick={() => setIsMaximized(!isMaximized)}
          aria-label={isMaximized ? "Minimize player" : "Maximize player"}
        >
          {isMaximized ? <MdOutlineCloseFullscreen /> : <MdOutlineOpenInFull />}
        </button>
      </div>
      <iframe
        style={{ borderRadius: "12px" }}
        src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`}
        width="100%"
        height={isMaximized ? "380" : "80"}
        frameBorder="0"
        allowFullScreen=""
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>
  );
};

SpotifyFrame.propTypes = {
  playlistId: PropTypes.string.isRequired,
};

export default SpotifyFrame;