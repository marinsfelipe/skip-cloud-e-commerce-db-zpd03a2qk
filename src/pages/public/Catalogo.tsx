import { useState, useEffect } from 'react'
import { useSeo } from '@/hooks/use-seo'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { FileDown, FileText } from 'lucide-react'

export default function Catalogo() {
  useSeo(
    'Catálogo',
    'Baixe ou visualize nosso catálogo completo em PDF.',
    'catálogo, pdf, vittorio design',
  )
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    pb.collection('settings')
      .getFirstListItem('key="catalog_pdf"')
      .then((record) => {
        if (record.file) {
          setPdfUrl(pb.files.getURL(record, record.file))
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="py-20 bg-background min-h-[calc(100vh-160px)] flex flex-col items-center justify-center">
      <div className="container px-4 text-center max-w-2xl animate-fade-in-up">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <FileText className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Catálogo Digital</h1>
        <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
          Tenha acesso ao nosso portfólio completo de equipamentos profissionais em alta resolução.
          Faça o download do material para consultar todas as especificações técnicas.
        </p>

        {pdfUrl ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto text-lg h-14 px-8">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                Visualizar Catálogo
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto text-lg h-14 px-8"
            >
              <a href={pdfUrl} download>
                <FileDown className="mr-2 w-5 h-5" /> Baixar PDF
              </a>
            </Button>
          </div>
        ) : (
          <div className="p-8 border border-border/50 rounded-xl bg-card/50 text-muted-foreground">
            O catálogo digital está sendo atualizado e estará disponível em breve.
          </div>
        )}
      </div>
    </div>
  )
}
