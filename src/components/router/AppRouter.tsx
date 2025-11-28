import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '../../pages/HomePage'
import { CategoriesPage } from '../../pages/CategoriesPage'
import { ResourceBrowsePage } from '../../pages/ResourceBrowsePage'
import { ResourceDetailPage } from '../../pages/ResourceDetailPage'
import { SearchResultsPage } from '../../pages/SearchResultsPage'
import { SubmitResourcePage } from '../../pages/SubmitResourcePage'
import { GuidelinesPage } from '../../pages/GuidelinesPage'
import { PrivacyPage } from '../../pages/PrivacyPage'
import { ContactPage } from '../../pages/ContactPage'
import { SupportPage } from '../../pages/SupportPage'
import { LoginPage } from '../../pages/LoginPage'
import { AdminPage } from '../../pages/AdminPage'
import { Layout } from '../layout/Layout'

function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">404 - Side ikke fundet</h1>
      <p className="text-muted-foreground mb-8">Siden du leder efter findes ikke.</p>
      <a href="/" className="text-primary hover:underline">Gå til forsiden</a>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/resources" element={<ResourceBrowsePage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/submit" element={<SubmitResourcePage />} />
        <Route path="/guidelines" element={<GuidelinesPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}