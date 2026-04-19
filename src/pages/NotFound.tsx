import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-serif font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground font-light">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="pt-6">
          <Link to="/" className="text-secondary font-medium hover:underline tracking-wide">
            VOLTAR PARA O INÍCIO
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
