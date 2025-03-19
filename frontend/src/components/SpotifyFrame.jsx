import "../styles/SpotifyFrame.css";

const SpotifyFrame = ({ playlistId }) => {
  return (
    <div className="spotify-container">
      <iframe
        style={{ borderRadius: "12px" }}
        src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`}
        width="100%"
        height="380" // Increased height for playlists
        frameBorder="0"
        allowFullScreen=""
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default SpotifyFrame;