migrate(
  (app) => {
    const collection = new Collection({
      name: 'contacts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'subject', type: 'text', required: true },
        { name: 'message', type: 'text', required: true },
        {
          name: 'inquiry_type',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['Orçamento', 'Dúvida Técnica'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('contacts')
    app.delete(collection)
  },
)
