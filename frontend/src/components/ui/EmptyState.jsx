
import { CalendarX } from "lucide-react";

export default function EmptyState({
  icon: Icon = CalendarX,
  title = "Aucun événement pour le moment",
  description = "Les prochains événements apparaîtront ici.",
  children,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-12 text-center ${className}`}
    >
      <div className="mb-4 rounded-full bg-indigo-50 p-4">
        <Icon size={32} className="text-indigo-500" />
      </div>

      <h2 className="text-xl font-semibold text-slate-900">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-slate-500">
        {description}
      </p>

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
