import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
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

// HashRouter : les adresses (#/cours…) fonctionnent sur GitHub Pages sans configuration serveur.
export function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Accueil />} />
            <Route path="positionnement" element={<Positionnement />} />
            <Route path="tableau" element={<TableauDeBord />} />
            <Route path="cours" element={<Cours />} />
            <Route path="cours/:theme" element={<CoursTheme />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="entrainement" element={<Entrainement />} />
            <Route path="examen" element={<Examen />} />
            <Route path="erreurs" element={<Erreurs />} />
            <Route path="reglages" element={<Reglages />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
