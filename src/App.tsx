import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { StoreProvider } from './lib/store'
import { Layout } from './components/Layout'
import { Accueil } from './pages/Accueil'
import { Positionnement } from './pages/Positionnement'
import { TableauDeBord } from './pages/TableauDeBord'
import { Cours, CoursTheme } from './pages/Cours'
import { Quiz } from './pages/Quiz'
import { Entrainement } from './pages/Entrainement'
import { Examen } from './pages/Examen'
import { Erreurs } from './pages/Erreurs'
import { Reglages } from './pages/Reglages'
import { Credits } from './pages/Credits'

/** Recrée la page à chaque navigation, même vers la même adresse (ex. menu « Examen blanc » depuis un résultat). */
function Neuf({ children }: { children: ReactNode }) {
  const { key } = useLocation()
  return <div key={key}>{children}</div>
}

// HashRouter : les adresses (#/cours…) fonctionnent sur GitHub Pages sans configuration serveur.
export function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Accueil />} />
            <Route path="positionnement" element={<Neuf><Positionnement /></Neuf>} />
            <Route path="tableau" element={<TableauDeBord />} />
            <Route path="cours" element={<Cours />} />
            <Route path="cours/:theme" element={<CoursTheme />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="entrainement" element={<Neuf><Entrainement /></Neuf>} />
            <Route path="examen" element={<Neuf><Examen /></Neuf>} />
            <Route path="erreurs" element={<Erreurs />} />
            <Route path="reglages" element={<Reglages />} />
            <Route path="credits" element={<Credits />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
