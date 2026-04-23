routerAdd(
  'GET',
  '/backend/v1/analytics/google-ads-status',
  (e) => {
    try {
      const record = $app.findFirstRecordByFilter('google_ads_config', '1=1', '-created')
      return e.json(200, {
        tag_id: record.getString('tag_id'),
        is_active: record.getBool('is_active'),
        conversion_send_to: record.getString('conversion_send_to'),
        updated: record.getString('updated'),
      })
    } catch (_) {
      return e.json(200, { tag_id: '', is_active: false, conversion_send_to: '', updated: '' })
    }
  },
  $apis.requireAuth(),
)
