const VARIANTS = {
  neutral: "bg-white/90 text-slate-800 backdrop-blur",
  dark: "bg-slate-900/80 text-white",
  warning: "bg-amber-400 text-amber-950",
  brand: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100",
};

export default function Badge({ variant = "brand", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

