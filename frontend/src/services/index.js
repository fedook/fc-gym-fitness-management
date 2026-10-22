import api from '@/services/api'

export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (payload) => api.post('/register', payload),
  logout: () => api.post('/logout'),
  me: () => api.get('/user'),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (payload) => api.post('/reset-password', payload),
}

export const dashboardService = {
  summary: () => api.get('/dashboard/summary'),
  revenue: (range) => api.get(`/dashboard/revenue?range=${range}`),
  recentMembers: () => api.get('/dashboard/recent-members'),
  upcomingAppointments: () => api.get('/dashboard/upcoming-appointments'),
  expiringMemberships: () => api.get('/dashboard/expiring-memberships'),
}

export const memberService = {
  list: (params) => api.get('/members', { params }),
  get: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  updateStatus: (id, status) => api.patch(`/members/${id}/status`, { status }),
  delete: (id) => api.delete(`/members/${id}`),
  memberships: (id) => api.get(`/members/${id}/memberships`),
  payments: (id, params) => api.get(`/members/${id}/payments`, { params }),
  attendance: (id, params) => api.get(`/members/${id}/attendance`, { params }),
}

export const planService = {
  list: (params) => api.get('/plans', { params }),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
}

export const paymentService = {
  list: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  get: (id) => api.get(`/payments/${id}`),
  update: (id, data) => api.put(`/payments/${id}`, data),
}

export const attendanceService = {
  list: (params) => api.get('/attendance', { params }),
  checkIn: (memberId) => api.post('/attendance/check-in', { member_id: memberId }),
  checkOut: (memberId) => api.post('/attendance/check-out', { member_id: memberId }),
}

export const trainerService = {
  list: (params) => api.get('/trainers', { params }),
  get: (id) => api.get(`/trainers/${id}`),
  create: (data) => api.post('/trainers', data),
  update: (id, data) => api.put(`/trainers/${id}`, data),
  delete: (id) => api.delete(`/trainers/${id}`),
}

export const appointmentService = {
  list: (params) => api.get('/appointments', { params }),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
}

export const reportService = {
  members: (params) => api.get('/reports/members', { params }),
  payments: (params) => api.get('/reports/payments', { params }),
  attendance: (params) => api.get('/reports/attendance', { params }),
}

export const settingsService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  users: (params) => api.get('/settings/users', { params }),
  createUser: (data) => api.post('/settings/users', data),
  updateUser: (id, data) => api.put(`/settings/users/${id}`, data),
  updateProfile: (data) => api.put('/profile', data),
}

export const portalService = {
  profile: () => api.get('/portal/profile'),
  updateProfile: (data) => api.put('/portal/profile', data),
  memberships: () => api.get('/portal/memberships'),
  payments: (params) => api.get('/portal/payments', { params }),
  attendance: (params) => api.get('/portal/attendance', { params }),
}
