routerAdd('POST', '/backend/v1/contact', (e) => {
  const body = e.requestInfo().body || {}
  const name = (body.name || '').trim()
  const email = (body.email || '').trim()
  const phone = (body.phone || '').trim()
  const subject = (body.subject || '').trim()
  const message = (body.message || '').trim()

  const errors = {}
  if (!name) errors['name'] = new ValidationError('validation_required', 'Name is required')
  if (!email) errors['email'] = new ValidationError('validation_required', 'Email is required')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors['email'] = new ValidationError('validation_invalid_email', 'Invalid email format')
  if (!phone) errors['phone'] = new ValidationError('validation_required', 'Phone is required')
  if (!subject)
    errors['subject'] = new ValidationError('validation_required', 'Subject is required')
  if (!message)
    errors['message'] = new ValidationError('validation_required', 'Message is required')
  else if (message.length < 10)
    errors['message'] = new ValidationError(
      'validation_min_length',
      'Message must be at least 10 characters long',
    )

  if (Object.keys(errors).length > 0) {
    throw new BadRequestError('Invalid data', errors)
  }

  const col = $app.findCollectionByNameOrId('contact_messages')
  const record = new Record(col)
  record.set('name', name)
  record.set('email', email)
  record.set('phone', phone)
  record.set('subject', subject)
  record.set('message', message)
  record.set('is_read', false)
  record.set('is_archived', false)

  $app.save(record)

  $app
    .logger()
    .info(
      'Email Sent to contato@vittoriodesign.com.br',
      'subject',
      'Contact Form Submission - ' + subject,
      'body',
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
    )

  $app.logger().info('Confirmation Email Sent', 'to', email, 'subject', 'Mensagem Recebida')

  try {
    const auditCol = $app.findCollectionByNameOrId('audit_log')
    const auditRec = new Record(auditCol)
    auditRec.set('action', 'contact_submission')
    auditRec.set('details', { ip: e.request.remoteAddr, email })
    $app.saveNoValidate(auditRec)
  } catch (err) {}

  return e.json(201, { id: record.id, message: 'Success' })
})
