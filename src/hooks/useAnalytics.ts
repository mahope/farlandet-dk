import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export function useAnalytics() {
  const location = useLocation()

  useEffect(() => {
    // Track page views
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname,
        page_title: document.title,
      })
    }
  }, [location])

  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  }

  const trackResourceView = (resourceId: string, resourceType: string) => {
    trackEvent('view_resource', 'resources', `${resourceType}-${resourceId}`)
  }

  const trackResourceSubmission = (resourceType: string) => {
    trackEvent('submit_resource', 'engagement', resourceType)
  }

  const trackSearch = (query: string) => {
    trackEvent('search', 'engagement', query)
  }

  const trackUserSignup = () => {
    trackEvent('sign_up', 'user_engagement')
  }

  const trackUserSignin = () => {
    trackEvent('sign_in', 'user_engagement')
  }

  return {
    trackEvent,
    trackResourceView,
    trackResourceSubmission,
    trackSearch,
    trackUserSignup,
    trackUserSignin,
  }
}