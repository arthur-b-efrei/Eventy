import Navbar from './Navbar.jsx'

// Cadre des pages connectées : navbar fixe + zone de contenu en dessous.
export default function AppLayout({ children }) {
  return (
    <div className="min-h-svh bg-nappe">
      <Navbar />
      <main className="mx-auto max-w-[960px] px-5 pt-24 pb-10">{children}</main>
    </div>
  )
}
