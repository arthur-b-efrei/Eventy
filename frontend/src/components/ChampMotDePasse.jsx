import { useState } from 'react'
import { AIDE, CHAMP, INPUT, LABEL } from './ui.js'

// Champ mot de passe avec un bouton pour l'afficher ou le cacher
export default function ChampMotDePasse({ id, label, value, onChange, autoComplete, aide }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={CHAMP}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          minLength={6}
          className={`${INPUT} pr-[90px]!`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-pressed={visible}
          className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-lg px-2.5 py-2 text-[13px] font-bold text-outremer focus-visible:outline-2 focus-visible:outline-outremer"
        >
          {visible ? 'Cacher' : 'Afficher'}
        </button>
      </div>
      {aide && <span className={AIDE}>{aide}</span>}
    </div>
  )
}
