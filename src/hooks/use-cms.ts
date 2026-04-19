import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from './use-realtime'

export function useCMS() {
  const [pages, setPages] = useState<any[]>([])
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  const [settings, setSettings] = useState<any[]>([])

  const load = async () => {
    try {
      const [p, s, st] = await Promise.all([
        pb.collection('pages').getFullList(),
        pb.collection('social_links').getFullList(),
        pb.collection('settings').getFullList(),
      ])
      setPages(p)
      setSocialLinks(s)
      setSettings(st)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('pages', load)
  useRealtime('social_links', load)
  useRealtime('settings', load)

  const getPageContent = (page: string, section: string, defaultText: string = '') => {
    const item = pages.find((p) => p.page_name === page && p.section_name === section)
    return item ? item.content : defaultText
  }

  const getSetting = (key: string) => {
    const item = settings.find((s) => s.key === key)
    if (!item) return null
    if (item.file) {
      return pb.files.getURL(item, item.file)
    }
    return item.value
  }

  const getSocialUrl = (platform: string) => {
    const item = socialLinks.find(
      (s) => s.platform.toLowerCase() === platform.toLowerCase() && s.is_active,
    )
    return item ? item.url : null
  }

  return { pages, socialLinks, settings, getPageContent, getSetting, getSocialUrl, load }
}
