import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCustomPageBySlug, CustomPage as CustomPageType } from '@/services/custom-pages'

export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState<CustomPageType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    getCustomPageBySlug(slug)
      .then((data) => {
        setPage(data)
        setLoading(false)
      })
      .catch(() => {
        navigate('/')
      })
  }, [slug, navigate])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!page) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-12 text-primary tracking-tight">
          {page.page_name}
        </h1>

        {/* Using standard prose classes for tailwind typography plugin integration */}
        <div
          className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-primary hover:prose-a:text-primary/80"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  )
}
