export const MOCK_PROMOTIONS = [
  {
    id: '1',
    name: 'Black Friday VIP',
    discount: 20,
    start_date: '2026-11-01T00:00:00Z',
    end_date: '2026-11-30T23:59:59Z',
    is_active: true,
    is_deleted: false,
  },
  {
    id: '2',
    name: 'Summer Collection',
    discount: 15,
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-02-28T23:59:59Z',
    is_active: false,
    is_deleted: false,
  },
]

export const MOCK_PRODUCTS = [
  {
    id: '1',
    code: 'VD.EX.VTR.001.00',
    name: 'Forno Inox Pro',
    line: 'Speciale',
    price: 15000,
    stock: 12,
    is_deleted: false,
  },
  {
    id: '2',
    code: 'VD.EX.VTR.002.00',
    name: 'Geladeira Duplex',
    line: 'Fredda',
    price: 25000,
    stock: 5,
    is_deleted: false,
  },
  {
    id: '3',
    code: 'VD.EX.VTR.003.00',
    name: 'Cooktop 5 Bocas',
    line: 'Cucinare',
    price: 8500,
    stock: 20,
    is_deleted: false,
  },
]

export const MOCK_POSTS = [
  {
    id: '1',
    title: 'Tendências 2026',
    date: '2026-04-10T10:00:00Z',
    status: 'Published',
    is_deleted: false,
  },
  {
    id: '2',
    title: 'Aço Inox na Alta Costura',
    date: '2026-04-15T14:30:00Z',
    status: 'Draft',
    is_deleted: false,
  },
]

export const MOCK_AUDIT_LOGS = [
  {
    id: '1',
    timestamp: '2026-04-19T10:00:00Z',
    user: 'Felipe',
    action: 'CREATE',
    entity: 'Product',
  },
  {
    id: '2',
    timestamp: '2026-04-18T15:20:00Z',
    user: 'Felipe',
    action: 'UPDATE',
    entity: 'Promotion',
  },
]

export const CHART_DATA = [
  { name: '00:00', requests: 120 },
  { name: '04:00', requests: 80 },
  { name: '08:00', requests: 450 },
  { name: '12:00', requests: 900 },
  { name: '16:00', requests: 750 },
  { name: '20:00', requests: 300 },
]

export const MOCK_API_LOGS = [
  {
    id: '1',
    timestamp: '2026-04-19T10:00:00Z',
    method: 'GET',
    endpoint: '/api/v1/products',
    status: 200,
    latency: '45ms',
    ip: '192.168.1.1',
  },
]

export const MOCK_USERS = [
  { id: '1', name: 'Felipe', email: 'admin@vittorio.com', role: 'Admin', is_active: true },
  { id: '2', name: 'Editor 1', email: 'editor1@vittorio.com', role: 'Editor', is_active: true },
]
