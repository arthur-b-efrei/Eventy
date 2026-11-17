import { useEffect, useId, useRef } from 'react'

// Fenêtre par-dessus la page, construite sur la balise HTML <dialog>.
// Le navigateur gère pour nous : la touche Échap, garder le focus dans la fenêtre,
// et rendre le reste de la page inactif. On ajoute : clic sur le fond = fermer.
export default function Modal({ ouvert, onFermer, titre, description, icone, danger = false, children }) {
  const dialog = useRef(null)
  const idTitre = useId()

  // Ouvre ou ferme la vraie fenêtre quand "ouvert" change
  useEffect(() => {
    const d = dialog.current
    if (ouvert && !d.open) d.showModal()
    if (!ouvert && d.open) d.close()
    // Pendant qu'une fenêtre est ouverte, la page derrière ne défile plus
    document.documentElement.style.overflow = ouvert ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [ouvert])

  return (
    <dialog
      ref={dialog}
      aria-labelledby={idTitre}
      onClose={onFermer}
      onClick={(e) => {
        // Clic en dehors de la boîte blanche (sur le fond sombre) : on ferme
        if (e.target === dialog.current) onFermer()
      }}
      className="m-auto max-h-[calc(100dvh-32px)] w-[min(100%-32px,480px)] overflow-y-auto rounded-3xl bg-white p-0 text-ardoise shadow-[0_30px_80px_rgba(26,28,46,0.35)] backdrop:bg-ardoise/55 backdrop:backdrop-blur-[3px] open:animate-modale"
    >
      {ouvert && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            {icone && (
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-2xl ${danger ? 'bg-[#ffe5ea] text-[#bf2e4c]' : 'bg-outremer/10 text-outremer'}`}
                aria-hidden="true"
              >
                {icone}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h2 id={idTitre} className="text-2xl font-bold">
                {titre}
              </h2>
              {description && <p className="mt-1 text-sm text-texte-doux">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onFermer}
              className="-mt-1 -mr-2 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-xl text-texte-doux transition hover:bg-nappe hover:text-ardoise focus-visible:outline-2 focus-visible:outline-outremer"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      )}
    </dialog>
  )
}

// Rangée de boutons en bas d'une fenêtre (Annuler à gauche, action principale à droite)
export function PiedModal({ children }) {
  return <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">{children}</div>
}
