import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '../layout/Layout'
import { HomePage } from '../../pages/HomePage'
import { ResourcesPage } from '../../pages/ResourcesPage'
import { ResourceDetailPage } from '../../pages/ResourceDetailPage'
import { CategoriesPage } from '../../pages/CategoriesPage'
import { RandomResourcePage } from '../../pages/RandomResourcePage'
import { SubmitResourcePage } from '../../pages/SubmitResourcePage'
import { GuidelinesPage } from '../../pages/GuidelinesPage'
import { PrivacyPage } from '../../pages/PrivacyPage'
import { ContactPage } from '../../pages/ContactPage'
import { SupportPage } from '../../pages/SupportPage'
import { LoginPage } from '../../pages/LoginPage'
import { ResetPasswordPage } from '../../pages/auth/ResetPasswordPage'
import { AdminDashboard } from '../../pages/admin/AdminDashboard'
import { ModerationPage } from '../../pages/admin/ModerationPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resource/:id" element={<ResourceDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/random" element={<RandomResourcePage />} />
          <Route path="/submit" element={<SubmitResourcePage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/moderation" element={<ModerationPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}