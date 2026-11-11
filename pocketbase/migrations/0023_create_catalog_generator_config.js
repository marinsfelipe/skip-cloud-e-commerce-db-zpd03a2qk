migrate(
  (app) => {
    const collection = new Collection({
      name: 'catalog_generator_config',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: null,
      fields: [
        { name: 'layout', type: 'text', required: true },
        { name: 'show_prices', type: 'bool' },
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'text' },
        { name: 'contact_info', type: 'text' },
        { name: 'cover_image', type: 'file', maxSelect: 1, maxSize: 8388608 },
        { name: 'updated_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('catalog_generator_config')
    app.delete(collection)
  },
)
