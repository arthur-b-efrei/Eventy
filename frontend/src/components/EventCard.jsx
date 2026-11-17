import { MapPin, CalendarDays, Clock, Users } from "lucide-react";
import Badge from "./ui/Badge.jsx";
import { getEventVisual } from "../utils/eventVisual.js";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
const dayFormat = new Intl.DateTimeFormat("fr-FR", { day: "2-digit" });
const monthFormat = new Intl.DateTimeFormat("fr-FR", { month: "short" });

function getCapacity(event) {
  const max = Number(event.nb_max_user) || 0;
  const count = Number(event.nb_user) || 0;
  const remaining = Math.max(max - count, 0);
  const percent = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;
  const isFull = max > 0 && remaining === 0;
  const isAlmostFull = !isFull && max > 0 && remaining <= Math.max(2, Math.ceil(max * 0.15));
  return { max, count, remaining, percent, isFull, isAlmostFull };
}

/**
 * Carte d'événement.
 * `action` (optionnel) : élément React affiché en bas de carte,
 * à utiliser uniquement quand la fonctionnalité existe (ex. réservation).
 */
export default function EventCard({ event, visual, action }) {
  const { label, icon: Icon, banner, iconColor } = visual ?? getEventVisual(event);

  const date = new Date(event.date_event);
  const hasDate = !Number.isNaN(date.getTime());
  const isPast = hasDate && date < new Date();
  const { max, count, remaining, percent, isFull, isAlmostFull } = getCapacity(event);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 ${isPast ? "opacity-75" : ""}`}
    >
      <div className={`relative h-28 bg-linear-to-br ${banner}`}>
        <Icon
          className="absolute -bottom-6 -right-4 h-32 w-32 text-white/15 transition duration-500 group-hover:-rotate-6 group-hover:scale-110"
          aria-hidden="true"
        />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant="neutral">{label}</Badge>
          {isPast ? (
            <Badge variant="dark">Terminé</Badge>
          ) : isFull ? (
            <Badge variant="dark">Complet</Badge>
          ) : isAlmostFull ? (
            <Badge variant="warning">Dernières places</Badge>
          ) : null}
        </div>

        {hasDate && (
          <div className="absolute right-4 top-4 flex flex-col items-center rounded-xl bg-white/95 px-2.5 py-1 leading-tight shadow-sm" aria-hidden="true">
            <span className="text-lg font-extrabold text-slate-900">{dayFormat.format(date)}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {monthFormat.format(date).replace(".", "")}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-5 flex h-14 w-14 translate-y-1/2 items-center justify-center rounded-2xl bg-white shadow-lg ring-4 ring-white">
          <Icon className={`h-7 w-7 ${iconColor}`} aria-hidden="true" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-10">
        <h2 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900">
          {event.titre}
        </h2>

        {event.describe && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
            {event.describe}
          </p>
        )}

        <ul className="mt-5 space-y-2.5 text-sm text-slate-600">
          <li className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-violet-500" aria-hidden="true" />
            <span className="sr-only">Lieu :</span>
            <span className="truncate">{event.localisation}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CalendarDays className="h-4 w-4 shrink-0 text-violet-500" aria-hidden="true" />
            <span className="sr-only">Date :</span>
            <span className="first-letter:uppercase">
              {hasDate ? dateFormat.format(date) : "Date à confirmer"}
            </span>
          </li>
          {hasDate && (
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-violet-500" aria-hidden="true" />
              <span className="sr-only">Heure :</span>
              <time dateTime={date.toISOString()}>{timeFormat.format(date)}</time>
            </li>
          )}
        </ul>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 font-medium text-slate-700">
              <Users className="h-4 w-4 text-violet-500" aria-hidden="true" />
              {count} / {max} participants
            </span>
            <span
              className={
                isFull ? "text-slate-400" : isAlmostFull ? "font-semibold text-amber-600" : "text-slate-500"
              }
            >
              {isFull ? "Complet" : `${remaining} place${remaining > 1 ? "s" : ""}`}
            </span>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Taux de remplissage"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-slate-400" : "bg-linear-to-r from-violet-500 to-indigo-500"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {action && <div className="mt-5">{action}</div>}
      </div>
    </article>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white" aria-hidden="true">
      <div className="h-28 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-5 pt-10">
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100 pt-4" />
        <div className="h-1.5 w-full animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}