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
  return pb.collection('pages').create({
    ...data,
    is_custom_page: true,
    section_name: 'content', // required field for base pages
  })
}

export const updateCustomPage = async (
  id: string,
  data: Partial<{ page_name: string; slug: string; content: string }>,
) => {
  return pb.collection('pages').update(id, data)
}

export const deleteCustomPage = async (id: string) => {
  return pb.collection('pages').delete(id)
}
