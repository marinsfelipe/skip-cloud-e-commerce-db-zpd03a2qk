import pb from '@/lib/pocketbase/client'

export interface CustomPage {
  id: string
  page_name: string
  slug: string
  content: string
  is_custom_page: boolean
  updated: string
  created: string
}

export const getCustomPages = async (): Promise<CustomPage[]> => {
  return pb.collection('pages').getFullList({
    filter: 'is_custom_page = true',
    sort: '-updated',
  })
}

export const getCustomPageBySlug = async (slug: string): Promise<CustomPage> => {
  return pb.collection('pages').getFirstListItem(`is_custom_page = true && slug = "${slug}"`)
}

export const createCustomPage = async (data: {
  page_name: string
  slug: string
  content: string
}) => {
  const payload = {
    ...data,
    content: data.content ? `uri:${encodeURIComponent(data.content)}` : '',
    is_custom_page: true,
    section_name: 'content', // required field for base pages
  }
  return pb.collection('pages').create(payload)
}

export const updateCustomPage = async (
  id: string,
  data: Partial<{ page_name: string; slug: string; content: string }>,
) => {
  const payload = { ...data }
  if (payload.content) {
    payload.content = `uri:${encodeURIComponent(payload.content)}`
  }
  return pb.collection('pages').update(id, payload)
}

export const deleteCustomPage = async (id: string) => {
  return pb.collection('pages').delete(id)
}
