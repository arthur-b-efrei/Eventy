import { useCallback, useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout.jsx'
import Avatar from '../components/Avatar.jsx'
import Bouton from '../components/Bouton.jsx'
import { useAuth } from '../context/AuthContext.js'
import {
  annulerReservation,
  listerInscrits,
  listerMesReservations,
  modifierEvenement,
  supprimerEvenement,
} from '../api/reservations.js'
import { CHAMP, ERREUR, INPUT, LABEL } from '../components/ui.js'

function formaterDate(valeur) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(valeur))
}

// Pour <input type="datetime-local">
function versInputDate(valeur) {
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function PanneauInscrits({ eventId, ouvert }) {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    if (!ouvert || !token) return

    let annule = false
    setChargement(true)
    setErreur('')

    listerInscrits(token, eventId)
      .then((res) => {
        if (!annule) setItems(res.items || [])
      })
      .catch((err) => {
        if (!annule) setErreur(err.message)
      })
      .finally(() => {
        if (!annule) setChargement(false)
      })

    return () => {
      annule = true
    }
  }, [ouvert, eventId, token])

  if (!ouvert) return null

  return (
    <div className="mt-4 border-t border-bordure pt-4">
      <h3 className="font-titre text-lg tracking-[-0.02em]">Inscrits</h3>
      {chargement ? <p className="mt-2 text-sm text-texte-doux">Chargement…</p> : null}
      {erreur ? <p className={`${ERREUR} mt-2`}>{erreur}</p> : null}
      {!chargement && !erreur && items.length === 0 ? (
        <p className="mt-2 text-sm text-texte-doux">Personne n’est inscrit pour le moment.</p>
      ) : null}
      {!chargement && items.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {items.map((item) => (
            <li
              key={item._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-nappe px-3.5 py-3"
            >
              <div className="flex items-center gap-3">
                <Avatar user={item.user} taille={36} />
                <div>
                  <p className="font-bold">{item.user?.name || 'Utilisateur inconnu'}</p>
                  <p className="text-sm text-texte-doux">{item.user?.email || '—'}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function FormulaireEvent({ event, onAnnuler, onSauve }) {
  const { token } = useAuth()
  const [describe, setDescribe] = useState(event.describe || '')
  const [dateEvent, setDateEvent] = useState(versInputDate(event.date_event))
  const [places, setPlaces] = useState(String(event.nb_max_user))
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function envoyer(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const maj = await modifierEvenement(token, event._id, {
        describe,
        date_event: new Date(dateEvent).toISOString(),
        nb_max_user: Number(places),
      })
      onSauve(maj)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <form className="mt-4 grid gap-3 rounded-xl border border-bordure bg-nappe p-4" onSubmit={envoyer}>
      <h3 className="font-titre text-lg tracking-[-0.02em]">Modifier l’événement</h3>

      <div className={CHAMP}>
        <label className={LABEL} htmlFor={`date-${event._id}`}>
          Date et heure
        </label>
        <input
          id={`date-${event._id}`}
          type="datetime-local"
          className={INPUT}
          value={dateEvent}
          onChange={(e) => setDateEvent(e.target.value)}
          required
        />
      </div>

      <div className={CHAMP}>
        <label className={LABEL} htmlFor={`desc-${event._id}`}>
          Description
        </label>
        <textarea
          id={`desc-${event._id}`}
          className={`${INPUT} h-auto min-h-[88px] resize-y py-3`}
          value={describe}
          maxLength={1000}
          onChange={(e) => setDescribe(e.target.value)}
          placeholder="Décris le plan…"
        />
      </div>

      <div className={CHAMP}>
        <label className={LABEL} htmlFor={`places-${event._id}`}>
          Nombre de places
        </label>
        <input
          id={`places-${event._id}`}
          type="number"
          className={INPUT}
          min={event.nb_user || 1}
          step={1}
          value={places}
          onChange={(e) => setPlaces(e.target.value)}
          required
        />
        <p className="text-[13px] text-texte-doux">
          Au moins {event.nb_user} (déjà inscrits).
        </p>
      </div>

      {erreur ? <p className={ERREUR}>{erreur}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Bouton variante="outremer" className="min-h-10 px-4 text-sm" type="submit" disabled={chargement}>
          {chargement ? 'Enregistrement…' : 'Enregistrer l’événement'}
        </Bouton>
        <Bouton variante="discret" className="min-h-10 px-4 text-sm" type="button" onClick={onAnnuler}>
          Fermer
        </Bouton>
      </div>
    </form>
  )
}

function CarteReservation({ item, onMajEvent, onSupprime, onSupprimeEvent }) {
  const { token } = useAuth()
  const [editionEvent, setEditionEvent] = useState(false)
  const [inscritsOuverts, setInscritsOuverts] = useState(false)
  const [action, setAction] = useState('')
  const [erreur, setErreur] = useState('')

  async function annuler() {
    const ok = window.confirm('Annuler cette réservation ? Cette action est définitive.')
    if (!ok) return

    setErreur('')
    setAction('delete')
    try {
      await annulerReservation(token, item._id)
      onSupprime(item._id)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setAction('')
    }
  }

  async function supprimerEvent() {
    const ok = window.confirm(
      'Supprimer cet événement ? Toutes les réservations associées seront aussi supprimées.',
    )
    if (!ok) return

    setErreur('')
    setAction('delete-event')
    try {
      await supprimerEvenement(token, item.event._id)
      onSupprimeEvent(item.event._id)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setAction('')
    }
  }

  const event = item.event

  return (
    <li className="rounded-2xl border border-bordure bg-white p-5 shadow-[0_10px_30px_rgba(26,28,46,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-texte-doux">
            <time dateTime={event.date_event}>{formaterDate(event.date_event)}</time>
          </p>
          <h2 className="mt-1 font-titre text-[1.45rem] tracking-[-0.03em]">{event.titre}</h2>
          <p className="mt-1 text-texte-doux">{event.localisation}</p>
          <p className="mt-2 text-sm font-bold text-outremer">
            {event.nb_user}/{event.nb_max_user} places prises
          </p>
          {item.estCreateur ? (
            <span className="mt-3 inline-flex rounded-full bg-lampion/20 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.04em] text-[#8a3d12]">
              Créateur
            </span>
          ) : null}
        </div>
      </div>

      {event.describe ? <p className="mt-3 text-texte-doux">{event.describe}</p> : null}

      {item.estCreateur && editionEvent ? (
        <FormulaireEvent
          event={event}
          onAnnuler={() => setEditionEvent(false)}
          onSauve={(maj) => {
            onMajEvent(maj)
            setEditionEvent(false)
          }}
        />
      ) : null}

      {erreur ? <p className={`${ERREUR} mt-3`}>{erreur}</p> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Bouton variante="outremer" className="min-h-10 px-4 text-sm" to={`/evenements/${event._id}/discussion`}>
          Discussion
        </Bouton>
        {item.estCreateur && !editionEvent ? (
          <Bouton
            variante="discret"
            className="min-h-10 px-4 text-sm"
            onClick={() => setEditionEvent(true)}
          >
            Modifier l’événement
          </Bouton>
        ) : null}
        {item.estCreateur ? (
          <Bouton
            variante="discret"
            className="min-h-10 px-4 text-sm"
            onClick={() => setInscritsOuverts((v) => !v)}
          >
            {inscritsOuverts ? 'Masquer les inscrits' : 'Voir les inscrits'}
          </Bouton>
        ) : null}
        <Bouton
          variante="outremer"
          className="min-h-10 bg-grenadine! px-4 text-sm hover:bg-[#e94b68]!"
          disabled={action === 'delete' || action === 'delete-event'}
          onClick={() => void annuler()}
        >
          {action === 'delete' ? 'Annulation…' : 'Annuler la réservation'}
        </Bouton>
        {item.estCreateur ? (
          <Bouton
            variante="discret"
            className="min-h-10 border-grenadine! px-4 text-sm text-grenadine!"
            disabled={action === 'delete-event' || action === 'delete'}
            onClick={() => void supprimerEvent()}
          >
            {action === 'delete-event' ? 'Suppression…' : 'Supprimer l’événement'}
          </Bouton>
        ) : null}
      </div>

      {item.estCreateur ? <PanneauInscrits eventId={event._id} ouvert={inscritsOuverts} /> : null}
    </li>
  )
}

export default function MesReservations() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  const charger = useCallback(async () => {
    if (!token) return
    setChargement(true)
    setErreur('')
    try {
      const res = await listerMesReservations(token)
      setItems(res.items || [])
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }, [token])

  useEffect(() => {
    void charger()
  }, [charger])

  return (
    <AppLayout>
      <h1 className="text-[clamp(28px,4.5vw,44px)]">Mes réservations</h1>
      <p className="mt-3 max-w-[40rem] text-texte-doux">
        Retrouve les événements auxquels tu es inscrit·e, modifie ton message ou annule ta place.
        Si tu es le créateur, tu peux aussi modifier ou supprimer l’événement et voir les inscrits.
      </p>

      {erreur ? <p className={`${ERREUR} mt-5`}>{erreur}</p> : null}
      {chargement ? <p className="mt-6 text-texte-doux">Chargement des réservations…</p> : null}

      {!chargement && items.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-bordure bg-white p-6">
          <h2 className="font-titre text-2xl tracking-[-0.03em]">Aucune réservation</h2>
          <p className="mt-2 text-texte-doux">
            Tu n’es inscrit·e à aucun événement pour le moment.
          </p>
        </section>
      ) : null}

      <ul className="mt-8 grid gap-4">
        {items.map((item) => (
          <CarteReservation
            key={item._id}
            item={item}
            onMajEvent={(event) =>
              setItems((prev) =>
                prev.map((r) =>
                  r.event?._id === event._id ? { ...r, event } : r,
                ),
              )
            }
            onSupprime={(id) => setItems((prev) => prev.filter((r) => r._id !== id))}
            onSupprimeEvent={(eventId) =>
              setItems((prev) => prev.filter((r) => r.event?._id !== eventId))
            }
          />
        ))}
      </ul>
    </AppLayout>
  )
}
