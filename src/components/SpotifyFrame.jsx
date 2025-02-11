import React from "react";
import "../styles/SpotifyFrame.css";
const SpotifyFrame = ({ trackUri }) => {

  return (
    <div className="spotify-container">
      <iframe
        style={{ borderRadius: "12px" }}
        src={`https://open.spotify.com/embed/track/${trackUri}?utm_source=generator`}
        width="100%"
        height="150"
        frameBorder="0"
        allowFullScreen=""
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default SpotifyFrame;
