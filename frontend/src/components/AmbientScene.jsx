// Minimal static backdrop — a solid surface with a barely-there top glow.
export default function AmbientScene() {
    return (
        <div
            aria-hidden
            className="fixed inset-0 -z-10"
            style={{
                background:
                    'radial-gradient(1200px 600px at 50% -10%, rgba(91,141,239,0.06), transparent 60%), #12141a',
            }}
        />
    )
}
