import { create } from 'zustand'

interface AssetStore {
  logoUrl: string | null
  catalogPdfUrl: string | null
  images: Record<string, string>
  setLogo: (url: string) => void
  setCatalogPdf: (url: string) => void
  setImage: (key: string, url: string) => void
}

export const useAssetStore = create<AssetStore>((set) => ({
  logoUrl: null,
  catalogPdfUrl: null,
  images: {},
  setLogo: (url) => set({ logoUrl: url }),
  setCatalogPdf: (url) => set({ catalogPdfUrl: url }),
  setImage: (key, url) => set((state) => ({ images: { ...state.images, [key]: url } })),
}))
