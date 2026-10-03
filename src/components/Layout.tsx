import { NavLink, Outlet, Link } from 'react-router-dom'

const LIENS = [
  { to: '/tableau', label: 'Tableau de bord', court: 'Accueil', icone: 'M3 11 12 4l9 7v9h-6v-6H9v6H3z' },
  { to: '/cours', label: 'Cours', court: 'Cours', icone: 'M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-7a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h7z' },
  { to: '/quiz', label: 'Quiz', court: 'Quiz', icone: 'M9 9a3 3 0 1 1 4 2.8c-.6.3-1 .9-1 1.6V15M12 19h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z' },
  { to: '/examen', label: 'Examen blanc', court: 'Examen', icone: 'M9 3h6l1 2h3v16H5V5h3zM9 12l2 2 4-4' },
  { to: '/reglages', label: 'Réglages', court: 'Réglages', icone: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4' },
]

export function Layout() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label="Feu Rouge, accueil">
            <span className="brand-lamp" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            Feu Rouge
          </Link>
          <nav className="topnav" aria-label="Navigation principale">
            {LIENS.map((l) => (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <nav className="bottomnav" aria-label="Navigation">
        {LIENS.map((l) => (
          <NavLink key={l.to} to={l.to}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={l.icone} />
            </svg>
            {l.court}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
