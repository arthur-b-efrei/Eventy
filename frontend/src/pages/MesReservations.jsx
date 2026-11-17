import AppLayout from '../components/AppLayout.jsx'

export default function MesReservations() {
  return (
    <AppLayout>
      <h1 className="text-[clamp(28px,4.5vw,44px)]">Mes réservations</h1>
      <p className="mt-3 text-texte-doux">
        Les événements auxquels tu es inscrit·e apparaîtront ici.
      </p>
    </AppLayout>
  )
}
