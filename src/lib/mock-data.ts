export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Poltrona Florence',
    line: 'Speciale',
    price: 4500,
    is_deleted: false,
    stock: 12,
  },
  {
    id: '2',
    name: 'Mesa de Jantar Milano',
    line: 'Strongest',
    price: 12800,
    is_deleted: false,
    stock: 5,
  },
  {
    id: '3',
    name: 'Sofá Chesterfield Velvet',
    line: 'Speciale',
    price: 9200,
    is_deleted: false,
    stock: 3,
  },
  { id: '4', name: 'Cadeira Bauhaus', line: 'Essenziale', price: 1200, is_deleted: true, stock: 0 },
  {
    id: '5',
    name: 'Luminária Pendente Lusso',
    line: 'Luce',
    price: 3400,
    is_deleted: false,
    stock: 8,
  },
]

export const MOCK_PROMOTIONS = [
  {
    id: '1',
    name: 'Black Friday Antecipada',
    discount: '20%',
    start_date: '2026-11-01T00:00:00Z',
    end_date: '2026-11-30T23:59:59Z',
    is_active: true,
  },
  {
    id: '2',
    name: 'Especial Dia das Mães',
    discount: '15%',
    start_date: '2026-05-01T00:00:00Z',
    end_date: '2026-05-15T23:59:59Z',
    is_active: false,
  },
]

export const MOCK_POSTS = [
  {
    id: '1',
    title: 'Tendências de Design de Interiores 2026',
    status: 'Published',
    date: '2026-04-10T14:30:00Z',
  },
  {
    id: '2',
    title: 'Como escolher a poltrona perfeita',
    status: 'Draft',
    date: '2026-04-18T09:00:00Z',
  },
]

export const MOCK_AUDIT_LOGS = [
  {
    id: '101',
    user: 'Felipe',
    action: 'UPDATE',
    entity: 'Product',
    timestamp: '2026-04-19T10:15:00Z',
  },
  {
    id: '102',
    user: 'Editor 1',
    action: 'CREATE',
    entity: 'Post',
    timestamp: '2026-04-19T09:30:00Z',
  },
  {
    id: '103',
    user: 'Felipe',
    action: 'SOFT_DELETE',
    entity: 'Product',
    timestamp: '2026-04-18T16:45:00Z',
  },
]

export const MOCK_API_LOGS = [
  {
    id: '201',
    endpoint: '/api/v1/products',
    method: 'GET',
    status: 200,
    latency: '45ms',
    ip: '192.168.1.1',
    timestamp: '2026-04-19T10:16:00Z',
  },
  {
    id: '202',
    endpoint: '/api/v1/promotions',
    method: 'GET',
    status: 200,
    latency: '32ms',
    ip: '192.168.1.1',
    timestamp: '2026-04-19T10:16:05Z',
  },
  {
    id: '203',
    endpoint: '/api/v1/products',
    method: 'GET',
    status: 429,
    latency: '12ms',
    ip: '10.0.0.5',
    timestamp: '2026-04-19T10:17:00Z',
  },
]

export const CHART_DATA = [
  { name: 'Seg', requests: 4000 },
  { name: 'Ter', requests: 3000 },
  { name: 'Qua', requests: 5000 },
  { name: 'Qui', requests: 4500 },
  { name: 'Sex', requests: 6000 },
  { name: 'Sáb', requests: 8000 },
  { name: 'Dom', requests: 7500 },
]
