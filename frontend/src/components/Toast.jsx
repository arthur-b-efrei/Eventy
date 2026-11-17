import { useEffect } from 'react'

// Petite notification en bas de l'écran ("Photo mise à jour"), qui disparaît toute seule
export default function Toast({ message, onFin, duree = 3500 }) {
  useEffect(() => {
    if (!message) return
    const minuteur = setTimeout(onFin, duree)
    return () => clearTimeout(minuteur)
  }, [message, onFin, duree])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4" aria-live="polite" role="status">
      {message && (
        <p
          key={message}
          className="flex animate-toast items-center gap-2.5 rounded-full bg-ardoise py-3 pr-5 pl-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(26,28,46,0.3)]"
        >
          <span className="grid size-6 place-items-center rounded-full bg-menthe text-xs text-ardoise" aria-hidden="true">
            ✓
          </span>
          {message}
        </p>
      )}
    </div>
  )
}
