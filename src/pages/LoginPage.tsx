import { Link, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'

export function LoginPage() {
  useSEO({
    title: 'Login - Farlandet.dk',
    description: 'Log ind på Farlandet.dk for at bidrage til fædrefællesskabet.',
    keywords: ['login', 'log ind', 'admin'],
    url: 'https://farlandet.dk/login',
    type: 'website'
  })

  // Redirect to admin page since that handles login now
  return <Navigate to="/admin" replace />
}