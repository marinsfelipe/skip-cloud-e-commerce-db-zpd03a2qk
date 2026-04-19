migrate(
  (app) => {
    const socialCol = app.findCollectionByNameOrId('social_links')
    const social = new Record(socialCol)
    social.set('platform', 'Instagram')
    social.set('url', 'https://www.instagram.com/vittoriodesignoficial/')
    social.set('is_active', true)
    app.save(social)

    const pagesCol = app.findCollectionByNameOrId('pages')
    const seeds = [
      {
        p: 'home',
        s: 'hero_title',
        t: 'editor',
        c: 'Vittorio Equipamentos Profissionais para <span class="text-primary">Food Service</span>',
      },
      {
        p: 'home',
        s: 'hero_subtitle',
        t: 'text',
        c: 'Elevando o padrão das cozinhas profissionais com design impecável e tecnologia de ponta.',
      },
      {
        p: 'home',
        s: 'mission',
        t: 'text',
        c: 'Fornecer equipamentos de excelência que potencializam a eficiência das operações gastronômicas.',
      },
      {
        p: 'home',
        s: 'vision',
        t: 'text',
        c: 'Ser referência nacional em inovação e durabilidade no segmento de Food Service.',
      },
      {
        p: 'home',
        s: 'values',
        t: 'text',
        c: 'Qualidade intransigente, compromisso com o cliente, sustentabilidade e inovação contínua.',
      },
      {
        p: 'sobre',
        s: 'intro',
        t: 'editor',
        c: 'A Vittorio Design nasceu do desejo de revolucionar as cozinhas profissionais. Unimos a engenharia de ponta à tradição do design italiano para criar soluções que não apenas funcionam com precisão absoluta, mas também elevam o aspecto visual do seu estabelecimento.',
      },
      {
        p: 'contato',
        s: 'intro',
        t: 'text',
        c: 'Estamos prontos para atender as necessidades do seu projeto com agilidade e precisão.',
      },
      {
        p: 'footer',
        s: 'about',
        t: 'text',
        c: 'Equipamentos Profissionais para Food Service. Excelência e durabilidade em Inox 304.',
      },
    ]

    for (const s of seeds) {
      const r = new Record(pagesCol)
      r.set('page_name', s.p)
      r.set('section_name', s.s)
      r.set('type', s.t)
      r.set('content', s.c)
      app.save(r)
    }

    const settingsCol = app.findCollectionByNameOrId('settings')
    const st1 = new Record(settingsCol)
    st1.set('key', 'site_logo')
    app.save(st1)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'marins.felipe@yahoo.com.br')
    } catch (_) {
      const record = new Record(users)
      record.setEmail('marins.felipe@yahoo.com.br')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      app.save(record)
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM social_links').execute()
    app.db().newQuery('DELETE FROM pages').execute()
    app.db().newQuery('DELETE FROM settings').execute()
  },
)
