migrate(
  (app) => {
    const contactMessages = new Collection({
      name: 'contact_messages',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'subject', type: 'text', required: true },
        { name: 'message', type: 'text', required: true },
        { name: 'is_read', type: 'bool', required: false },
        { name: 'is_archived', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_contact_messages_created ON contact_messages (created)',
        'CREATE INDEX idx_contact_messages_is_read ON contact_messages (is_read)',
        'CREATE INDEX idx_contact_messages_email ON contact_messages (email)',
      ],
    })
    app.save(contactMessages)

    const googleAdsConfig = new Collection({
      name: 'google_ads_config',
      type: 'base',
      listRule: '',
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'tag_id', type: 'text', required: true },
        { name: 'conversion_send_to', type: 'text', required: false },
        { name: 'is_active', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(googleAdsConfig)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('contact_messages'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('google_ads_config'))
    } catch (_) {}
  },
)
