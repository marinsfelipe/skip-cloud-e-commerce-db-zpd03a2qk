import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export function GoogleAdsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<{ tag_id: string; is_active: boolean } | null>(null)

  useEffect(() => {
    pb.collection('google_ads_config')
      .getFirstListItem('', { sort: '-created' })
      .then((record) => {
        setConfig({
          tag_id: record.tag_id,
          is_active: record.is_active,
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (config?.is_active && config.tag_id) {
      const scriptId = 'google-ads-script'
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script')
        script.id = scriptId
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${config.tag_id}`
        document.head.appendChild(script)

        const script2 = document.createElement('script')
        script2.id = scriptId + '-init'
        script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${config.tag_id}');
        `
        document.head.appendChild(script2)
      }
    }
  }, [config])

  return <>{children}</>
}
