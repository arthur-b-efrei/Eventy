import { useEffect, useId, useRef, useState } from 'react'
import { suggererAdresses } from '../api/adresses.js'

const DELAI_MS = 250 // on attend que l'utilisateur arrête de taper avant d'appeler l'API

// Champ texte avec une liste de suggestions d'adresses (ou de villes) sous le champ.
// Clavier : flèches pour choisir, Entrée pour valider, Échap pour fermer.
// - onChange(texte) : à chaque frappe (le champ reste un champ texte normal)
// - onChoisir({ label, lat, lng }) : quand une suggestion est choisie
export default function ChampAdresse({
  id,
  name,
  value,
  onChange,
  onChoisir,
  type = 'adresse',
  placeholder,
  className = '',
  invalide = false,
  autoFocus = false,
  required = false,
}) {
  const idListe = useId()
  const [suggestions, setSuggestions] = useState([])
  const [ouvert, setOuvert] = useState(false)
  const [actif, setActif] = useState(-1) // suggestion surlignée au clavier
  const [indisponible, setIndisponible] = useState(false)
  const choisiRef = useRef('') // dernier texte choisi : pas besoin de rechercher à nouveau

  useEffect(() => {
    const texte = value.trim()
    if (texte.length < 3 || texte === choisiRef.current) {
      setSuggestions([])
      return
    }
    const annulation = new AbortController()
    const minuterie = setTimeout(async () => {
      try {
        const resultats = await suggererAdresses(texte, { type, signal: annulation.signal })
        setSuggestions(resultats)
        setActif(-1)
        setIndisponible(false)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSuggestions([])
          setIndisponible(true)
        }
      }
    }, DELAI_MS)
    return () => {
      clearTimeout(minuterie)
      annulation.abort()
    }
  }, [value, type])

  function choisir(suggestion) {
    choisiRef.current = suggestion.label
    onChange(suggestion.label)
    onChoisir?.(suggestion)
    setSuggestions([])
    setOuvert(false)
  }

  function surTouche(e) {
    if (!ouvert || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActif((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActif((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && actif >= 0) {
      e.preventDefault() // sinon le formulaire part
      choisir(suggestions[actif])
    } else if (e.key === 'Escape') {
      setOuvert(false)
    }
  }

  const listeVisible = ouvert && suggestions.length > 0

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listeVisible}
        aria-controls={idListe}
        aria-activedescendant={listeVisible && actif >= 0 ? `${idListe}-${actif}` : undefined}
        aria-invalid={invalide || undefined}
        value={value}
        placeholder={placeholder}
        className={className}
        autoFocus={autoFocus}
        required={required}
        onChange={(e) => {
          choisiRef.current = ''
          onChange(e.target.value)
          setOuvert(true)
        }}
        onFocus={() => setOuvert(true)}
        // Petit délai : laisse le temps au clic sur une suggestion d'arriver
        onBlur={() => setTimeout(() => setOuvert(false), 150)}
        onKeyDown={surTouche}
      />

      {listeVisible ? (
        <ul
          id={idListe}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.label}-${s.lat}-${s.lng}`}
              id={`${idListe}-${i}`}
              role="option"
              aria-selected={i === actif}
              // mousedown plutôt que click : il arrive avant le blur du champ
              onMouseDown={(e) => {
                e.preventDefault()
                choisir(s)
              }}
              onMouseEnter={() => setActif(i)}
              className={`cursor-pointer px-4 py-2.5 text-left text-sm ${i === actif ? 'bg-violet-50' : ''}`}
            >
              <span className="block font-semibold text-slate-900">{s.label}</span>
              {s.contexte ? <span className="block text-xs text-slate-500">{s.contexte}</span> : null}
            </li>
          ))}
          <li role="presentation" className="px-4 pt-1.5 pb-1 text-right text-[11px] text-slate-400" aria-hidden="true">
            Adresses : Géoplateforme IGN
          </li>
        </ul>
      ) : null}

      {indisponible ? (
        <p className="mt-1.5 text-xs text-slate-500">Suggestions indisponibles pour le moment : saisis l'adresse complète.</p>
      ) : null}
    </div>
  )
}
