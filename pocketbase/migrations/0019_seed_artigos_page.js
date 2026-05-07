migrate(
  (app) => {
    const pages = app.findCollectionByNameOrId('pages')

    try {
      app.findFirstRecordByData('pages', 'slug', 'artigos')
      return // already seeded
    } catch (_) {}

    const record = new Record(pages)
    record.set('page_name', 'Artigos')
    record.set('slug', 'artigos')
    record.set('section_name', 'Institucional')
    record.set('is_custom_page', true)
    record.set(
      'content',
      '<div id="soro-blog"></div><script src="https://app.trysoro.com/api/embed/399da0d5-ad29-42bc-9f3b-287ff2dc83ef" defer></script>',
    )

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('pages', 'slug', 'artigos')
      app.delete(record)
    } catch (_) {}
  },
)
