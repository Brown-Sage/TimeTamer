import { useEffect, useState } from 'react';
import { FaSpotify } from 'react-icons/fa';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

// Menu entry for the Spotify scaffold. Connect = full-page navigation to
// the backend, which 302s to the Spotify consent screen; the callback
// lands back in the SPA. Disconnect is a plain API call.
export default function SpotifyConnect() {
    const { user } = useAuth();
    const [connected, setConnected] = useState(false);
    const [configured, setConfigured] = useState(true);

    useEffect(() => {
        if (!user) return undefined;
        let cancelled = false;
        api.get('api/spotify/status/')
            .then(({ data }) => {
                if (cancelled) return;
                setConnected(Boolean(data?.connected));
                setConfigured(Boolean(data?.configured));
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [user]);

    if (!user) return null;

    const handleClick = () => {
        if (connected) {
            api.delete('api/spotify/disconnect/')
                .then(() => setConnected(false))
                .catch(() => {});
            return;
        }
        // Backend answers with a redirect to accounts.spotify.com.
        window.location.assign('/api/spotify/login/');
    };

    const label = connected ? 'Linked' : configured ? 'Music' : 'Setup';

    return (
        <div onClick={handleClick} className={`stats spotify-button ${connected ? 'connected' : ''}`}>
            <FaSpotify />
            <p>{label}</p>
        </div>
    );
}
