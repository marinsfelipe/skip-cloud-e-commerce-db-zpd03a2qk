import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export function ImageUploader({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Arquivo muito grande (< 5MB)' })
      return
    }

    setUploading(true)
    setProgress(0)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/images`, true)
    xhr.setRequestHeader('Authorization', pb.authStore.token)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      setUploading(false)
      if (xhr.status === 200) {
        toast({ title: 'Upload concluído' })
        onUploadSuccess()
      } else {
        toast({ variant: 'destructive', title: 'Erro no upload' })
      }
    }

    xhr.onerror = () => {
      setUploading(false)
      toast({ variant: 'destructive', title: 'Erro de rede' })
    }

    xhr.ontimeout = () => {
      setUploading(false)
      toast({ variant: 'destructive', title: 'Timeout (30s)' })
    }
    xhr.timeout = 30000

    const formData = new FormData()
    formData.append('file', file)
    xhr.send(formData)
  }

  return (
    <div className="w-full">
      {!uploading ? (
        <label className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center rounded-md px-4 py-2 cursor-pointer shadow-sm text-sm font-medium transition-colors">
          <Upload className="mr-2 h-4 w-4" /> Upload de Imagem
          <input
            type="file"
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="space-y-2 w-full">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Enviando...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 w-full" />
        </div>
      )}
    </div>
  )
}
