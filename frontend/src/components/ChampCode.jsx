import { useRef } from 'react'

const LONGUEUR = 6

// 6 cases pour taper le code reçu par email.
// - on passe à la case suivante tout seul
// - Retour arrière revient à la case d'avant
// - on peut coller le code entier d'un coup
// - sur téléphone, le clavier propose le code reçu (autoComplete="one-time-code")
export default function ChampCode({ valeur, onChange, desactive }) {
  const cases = useRef([])
  const chiffres = valeur.padEnd(LONGUEUR, ' ').slice(0, LONGUEUR).split('')

  function mettreAJour(nouveauxChiffres) {
    onChange(nouveauxChiffres.join('').replace(/\s/g, ''))
  }

  function taper(index, texte) {
    const seulementChiffres = texte.replace(/\D/g, '')
    if (!seulementChiffres) return

    // Plusieurs chiffres d'un coup (collage ou remplissage auto) : on remplit à partir de cette case
    const copie = [...chiffres]
    seulementChiffres
      .slice(0, LONGUEUR - index)
      .split('')
      .forEach((c, i) => {
        copie[index + i] = c
      })
    mettreAJour(copie)

    const suivante = Math.min(index + seulementChiffres.length, LONGUEUR - 1)
    cases.current[suivante]?.focus()
  }

  function toucheAppuyee(index, e) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const copie = [...chiffres]
      if (copie[index].trim()) {
        copie[index] = ' '
      } else if (index > 0) {
        copie[index - 1] = ' '
        cases.current[index - 1]?.focus()
      }
      mettreAJour(copie)
    } else if (e.key === 'ArrowLeft' && index > 0) {
      cases.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < LONGUEUR - 1) {
      cases.current[index + 1]?.focus()
    }
  }

  return (
    <div className="code-cases" role="group" aria-label="Code à 6 chiffres">
      {chiffres.map((chiffre, index) => (
        <input
          key={index}
          ref={(el) => (cases.current[index] = el)}
          id={`code-${index}`}
          className={chiffre.trim() ? 'rempli' : ''}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Chiffre ${index + 1}`}
          value={chiffre.trim()}
          onChange={(e) => taper(index, e.target.value)}
          onKeyDown={(e) => toucheAppuyee(index, e)}
          onFocus={(e) => e.target.select()}
          onPaste={(e) => {
            e.preventDefault()
            taper(index, e.clipboardData.getData('text'))
          }}
          disabled={desactive}
          autoFocus={index === 0}
        />
      ))}
    </div>
  )
}
