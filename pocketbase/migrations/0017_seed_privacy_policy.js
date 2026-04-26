migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('pages')
    try {
      app.findFirstRecordByData('pages', 'slug', 'politica-de-privacidade')
    } catch (_) {
      const record = new Record(col)
      record.set('page_name', 'Política de Privacidade')
      record.set('section_name', 'content')
      record.set('slug', 'politica-de-privacidade')
      record.set('is_custom_page', true)
      record.set(
        'content',
        '<h1>Política de Privacidade</h1><p>Esta é a política de privacidade padrão da Vittorio Design. Comprometemo-nos a proteger a sua privacidade e os seus dados pessoais.</p><h2>1. Coleta de Dados</h2><p>Coletamos dados fornecidos voluntariamente através dos nossos formulários de contato, como nome, email e telefone.</p><h2>2. Uso dos Dados</h2><p>Utilizamos seus dados apenas para responder às suas solicitações e enviar orçamentos solicitados. Não compartilhamos suas informações com terceiros.</p>',
      )
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('pages', 'slug', 'politica-de-privacidade')
      app.delete(record)
    } catch (_) {}
  },
)
