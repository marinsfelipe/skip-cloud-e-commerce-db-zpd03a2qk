migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"
    users.updateRule = "@request.auth.id != ''"
    users.deleteRule = "@request.auth.id != ''"

    if (!users.fields.getByName('role')) {
      users.fields.add(new SelectField({ name: 'role', values: ['Admin', 'Editor'], maxSelect: 1 }))
    }
    if (!users.fields.getByName('is_active')) {
      users.fields.add(new BoolField({ name: 'is_active' }))
    }
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    users.fields.removeByName('role')
    users.fields.removeByName('is_active')
    app.save(users)
  },
)
