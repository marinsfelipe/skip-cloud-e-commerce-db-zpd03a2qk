migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('catalog_pages')
    try {
      app.findFirstRecordByData('catalog_pages', 'sort_order', 1)
      return // already seeded
    } catch (_) {}

    // Seeding dummy records without files so the frontend can display placeholders initially.
    for (let i = 1; i <= 3; i++) {
      const record = new Record(col)
      record.set('sort_order', i)
      app.save(record)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('catalog_pages')
    app.truncateCollection(col)
  },
)
