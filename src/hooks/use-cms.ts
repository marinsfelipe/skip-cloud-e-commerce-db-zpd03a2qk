import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'

export function useCMS() {
  const [pages, setPages] = useState<any[]>([])
  const [settings, setSettings] = useState<any[]>([])
  const [socials, setSocials] = useState<any[]>([])

  const loadData = useCallback(async () => {
    try {
      const [p, st, soc] = await Promise.all([
        pb
          .collection('pages')
          .getFullList({ expand: 'image' })
          .catch(() => []),
        pb
          .collection('settings')
          .getFullList()
          .catch(() => []),
        pb
          .collection('social_links')
          .getFullList()
          .catch(() => []),
      ])
      setPages(p)
      setSettings(st)
      setSocials(soc)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getPageContent = (pageName: string, sectionName: string, fallback: string = '') => {
    const p = pages.find((x) => x.page_name === pageName && x.section_name === sectionName)
    return p?.content || fallback
  }

  const getPageImage = (pageName: string, sectionName: string) => {
    const p = pages.find((x) => x.page_name === pageName && x.section_name === sectionName)
    if (p?.expand?.image?.file) {
      return pb.files.getURL(p.expand.image, p.expand.image.file)
    }
    return null
  }

  const getSetting = (key: string, fallback: string = '') => {
    const s = settings.find((x) => x.key === key)
    if (s?.file) {
      return pb.files.getURL(s, s.file)
    }
    return s?.value || fallback
  }

  const getSocialUrl = (platform: string) => {
    const s = socials.find((x) => x.platform === platform && x.is_active)
    return s?.url || ''
  }

  const getAllSocials = () => socials.filter((s) => s.is_active)

  return {
    pages,
    settings,
    socials,
    getPageContent,
    getPageImage,
    getSetting,
    getSocialUrl,
    getAllSocials,
    loadData,
  }
}
