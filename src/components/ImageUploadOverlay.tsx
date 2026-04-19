import { Upload } from 'lucide-react'

interface ImageUploadOverlayProps {
  onUpload: (url: string) => void
  label?: string
  className?: string
}

export function ImageUploadOverlay({
  onUpload,
  label = 'Upload',
  className = '',
}: ImageUploadOverlayProps) {
  return (
    <div
      className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10 cursor-pointer ${className}`}
    >
      <label className="text-primary-foreground text-sm font-semibold bg-primary hover:bg-primary/90 px-4 py-2 rounded cursor-pointer flex items-center gap-2 shadow-lg">
        <Upload className="w-4 h-4" />
        {label}
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const url = URL.createObjectURL(file)
              onUpload(url)
            }
          }}
        />
      </label>
    </div>
  )
}
