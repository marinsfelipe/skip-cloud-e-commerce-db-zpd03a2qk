onRecordAfterCreateSuccess((e) => {
  try {
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName || 'Site',
      },
      to: [{ address: 'contato@vittoriodesign.com.br' }],
      subject: 'Novo contato: ' + e.record.getString('subject'),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nova Mensagem de Contato</h2>
          <p><strong>Nome:</strong> ${e.record.getString('name')}</p>
          <p><strong>E-mail:</strong> ${e.record.getString('email')}</p>
          <p><strong>Tipo de Contato:</strong> ${e.record.getString('inquiry_type')}</p>
          <p><strong>Assunto:</strong> ${e.record.getString('subject')}</p>
          <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
            <p style="margin-top: 0;"><strong>Mensagem:</strong></p>
            <p>${e.record.getString('message').replace(/\n/g, '<br/>')}</p>
          </div>
        </div>
      `,
    })

    $app.newMailClient().send(message)
    $app.logger().info('Email de contato encaminhado com sucesso', 'contactId', e.record.id)
  } catch (err) {
    $app
      .logger()
      .error('Falha ao enviar email de contato', 'error', err.message, 'contactId', e.record.id)
  }

  e.next()
}, 'contacts')
