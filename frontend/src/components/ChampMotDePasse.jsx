import { useState } from 'react'

// Champ mot de passe avec un bouton pour l'afficher ou le cacher
export default function ChampMotDePasse({ id, label, value, onChange, autoComplete, aide }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="champ">
      <label htmlFor={id}>{label}</label>
      <div className="champ-mdp">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          minLength={6}
        />
        <button type="button" onClick={() => setVisible(!visible)} aria-pressed={visible}>
          {visible ? 'Cacher' : 'Afficher'}
        </button>
      </div>
      {aide && <span className="aide">{aide}</span>}
    </div>
  )
}
