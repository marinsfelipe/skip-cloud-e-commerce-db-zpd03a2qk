import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'

export function AnalyticsTracker() {
  const location = useLocation()

  // Track page views
  useEffect(() => {
    const trackView = async () => {
      try {
        await pb.collection('site_analytics').create({
          event_type: 'page_view',
          path: location.pathname,
        })
      } catch {
        // silent failure for analytics
      }
    }
    trackView()
  }, [location.pathname])

  // Track clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement
        const interactiveElement = target.closest('a, button, [role="button"]') as HTMLElement

        if (interactiveElement) {
          const label =
            interactiveElement.getAttribute('aria-label') ||
            interactiveElement.title ||
            interactiveElement.innerText?.trim() ||
            ''

          const id = interactiveElement.id || interactiveElement.getAttribute('href') || ''

          pb.collection('site_analytics')
            .create({
              event_type: 'click',
              path: window.location.pathname,
              element_label: label.substring(0, 100),
              element_id: id.substring(0, 100),
            })
            .catch(() => {})
        }
      } catch {
        // silent failure
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [])

  return null
}
