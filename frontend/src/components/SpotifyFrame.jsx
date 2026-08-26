import { useState } from 'react'
import PropTypes from 'prop-types'
import { MdOutlineOpenInFull, MdOutlineCloseFullscreen } from 'react-icons/md'
import { IoClose } from 'react-icons/io5'

export default function SpotifyFrame({ playlistId, onClose }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="rounded-3xl border border-white/10 bg-panel p-3">
            <div className="mb-2 flex justify-between">
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-label={expanded ? 'Minimize player' : 'Expand player'}
                    className="rounded-full p-1.5 text-parchment transition-colors hover:bg-white/10 hover:text-cream"
                >
                    {expanded ? (
                        <MdOutlineCloseFullscreen size={16} />
                    ) : (
                        <MdOutlineOpenInFull size={16} />
                    )}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close player"
                    className="rounded-full p-1.5 text-parchment transition-colors hover:bg-white/10 hover:text-clay"
                >
                    <IoClose size={16} />
                </button>
            </div>
            <iframe
                title="Spotify playlist"
                style={{ borderRadius: '14px', display: 'block' }}
                src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`}
                width="100%"
                height={expanded ? '380' : '152'}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            />
        </div>
    )
}

SpotifyFrame.propTypes = {
    playlistId: PropTypes.string.isRequired,
    onClose: PropTypes.func,
}

SpotifyFrame.defaultProps = {
    onClose: () => {},
}
