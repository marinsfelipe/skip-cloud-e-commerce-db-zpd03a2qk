migrate(
  (app) => {
    const pages = app.findCollectionByNameOrId('pages')
    const socialLinks = app.findCollectionByNameOrId('social_links')

    const pagesToSeed = [
      { page_name: 'home', section_name: 'hero_background', type: 'image' },
      { page_name: 'home', section_name: 'featured_lines', type: 'image' },
      { page_name: 'sobre', section_name: 'main_content', type: 'image' },
      { page_name: 'contato', section_name: 'background', type: 'image' },
    ]

    for (const p of pagesToSeed) {
      try {
        app.findFirstRecordByFilter(
          'pages',
          `page_name='${p.page_name}' && section_name='${p.section_name}'`,
        )
      } catch (_) {
        const record = new Record(pages)
        record.set('page_name', p.page_name)
        record.set('section_name', p.section_name)
        record.set('type', p.type)
        app.save(record)
      }
    }

    const socials = [
      {
        platform: 'linkedin',
        url: 'https://www.linkedin.com/company/vittorio-design',
        is_active: true,
      },
      { platform: 'whatsapp', url: 'https://wa.me/5521990451568', is_active: true },
      {
        platform: 'instagram',
        url: 'https://www.instagram.com/vittoriodesignoficial/',
        is_active: true,
      },
    ]

    app.db().newQuery('DELETE FROM social_links').execute()

    for (const s of socials) {
      const record = new Record(socialLinks)
      record.set('platform', s.platform)
      record.set('url', s.url)
      record.set('is_active', s.is_active)
      app.save(record)
    }
  },
  (app) => {
    // Down migration intentionally empty for seeds
  },
)
