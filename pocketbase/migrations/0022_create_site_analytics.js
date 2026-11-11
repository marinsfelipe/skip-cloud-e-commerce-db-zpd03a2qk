migrate(
  (app) => {
    const collection = new Collection({
      name: 'site_analytics',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: null,
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'event_type', type: 'text', required: true },
        { name: 'path', type: 'text', required: true },
        { name: 'element_label', type: 'text' },
        { name: 'element_id', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_site_analytics_event_type ON site_analytics (event_type)',
        'CREATE INDEX idx_site_analytics_path ON site_analytics (path)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('site_analytics')
    app.delete(collection)
  },
)
