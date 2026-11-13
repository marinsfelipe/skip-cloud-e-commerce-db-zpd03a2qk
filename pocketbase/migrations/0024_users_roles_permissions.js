migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Perfis de acesso: Administrador, Editor e Visualizador.
    const roleField = users.fields.getByName('role')
    if (roleField) {
      roleField.values = ['Admin', 'Editor', 'Viewer']
    } else {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['Admin', 'Editor', 'Viewer'],
          maxSelect: 1,
        }),
      )
    }

    // Status ativo/inativo (login de usuário inativo é bloqueado em hook).
    if (!users.fields.getByName('is_active')) {
      users.fields.add(new BoolField({ name: 'is_active' }))
    }

    // Normaliza registros existentes: sem perfil => Viewer; sem status => ativo.
    app.db().newQuery("UPDATE users SET role = 'Viewer' WHERE role = '' OR role IS NULL").execute()
    app
      .db()
      .newQuery(
        "UPDATE users SET is_active = true WHERE is_active IS NULL OR is_active = false AND role = 'Admin'",
      )
      .execute()

    // --- API rules ---
    // Listar/ver: qualquer usuário autenticado do painel (a listagem de
    // usuários é do painel; quem chega até aqui já passou pelo login).
    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"

    // Criar: apenas administradores autenticados. (Cadastro público é feito
    // via convite do painel, nunca por visitantes anônimos.)
    users.createRule = "@request.auth.id != '' && @request.auth.role = 'Admin'"

    // Atualizar: o próprio usuário (dados básicos) OU administrador.
    users.updateRule =
      "@request.auth.id != '' && (@request.auth.id = id || @request.auth.role = 'Admin')"

    // Excluir: apenas administradores, e nunca o próprio admin principal
    // (um admin não pode excluir a si mesmo).
    users.deleteRule =
      "@request.auth.id != '' && @request.auth.role = 'Admin' && id != @request.auth.id"

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"
    users.createRule = ''
    users.updateRule = "@request.auth.id != ''"
    users.deleteRule = "@request.auth.id != ''"
    const roleField = users.fields.getByName('role')
    if (roleField) roleField.values = ['Admin', 'Editor']
    app.save(users)
  },
)
