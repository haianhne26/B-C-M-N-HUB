// Typed API Client for BẠC MÔN HUB Desktop
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('bmh_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('bmh_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('bmh_token');
  localStorage.removeItem('bmh_user');
}

export function getCachedUser(): any | null {
  const data = localStorage.getItem('bmh_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    // A corrupt legacy cache must not prevent the login screen from rendering.
    localStorage.removeItem('bmh_user');
    return null;
  }
}

export function setCachedUser(user: any) {
  localStorage.setItem('bmh_user', JSON.stringify(user));
}

export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem('bmh_device_id');
  if (!id) {
    id = 'DEV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    localStorage.setItem('bmh_device_id', id);
  }
  return id;
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Lỗi kết nối máy chủ');
  }
  return json;
}

export const api = {
  // 1. Auth
  async login(email: string, password: string) {
    const deviceIdentifier = getOrCreateDeviceId();
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, deviceIdentifier, deviceName: 'Windows Desktop Client' })
    });
    if (res.data?.token) {
      setAuthToken(res.data.token);
      setCachedUser(res.data.user);
    }
    return res.data;
  },

  async register(email: string, password: string, fullName: string, phone?: string) {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phone })
    });
    if (res.data?.token) {
      setAuthToken(res.data.token);
      setCachedUser(res.data.user);
    }
    return res.data;
  },

  async getMe() {
    const res = await request('/auth/me');
    setCachedUser(res.data);
    return res.data;
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },

  // 2. Licenses
  async activateKey(keyCode: string) {
    return request('/licenses/activate', {
      method: 'POST',
      body: JSON.stringify({ keyCode })
    });
  },

  async listKeys(page = 1, limit = 20, search = '', status = '') {
    return request(`/licenses?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`);
  },

  async createKeys(payload: { count: number; maxDevices: number; durationDays: number; allowedServices: string[]; notes?: string }) {
    return request('/licenses/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async revokeKey(id: string) {
    return request(`/licenses/${id}/revoke`, { method: 'PATCH' });
  },

  async resetKeyDevices(id: string) {
    return request(`/licenses/${id}/reset-devices`, { method: 'POST' });
  },

  // 3. MT5
  async getMT5Summary() {
    return request('/mt5/summary');
  },

  async getMT5Positions() {
    return request('/mt5/positions');
  },

  async getMT5History() {
    return request('/mt5/history');
  },

  // 4. Bạc Môn AI
  async analyzeChart(imageBase64: string, userQuestion?: string, conversationId?: string) {
    return request('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, userQuestion, conversationId })
    });
  },

  async sendAIChat(conversationId: string, message: string) {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ conversationId, message })
    });
  },

  async getAIConversations() {
    return request('/ai/conversations');
  },

  async getAIMessages(conversationId: string) {
    return request(`/ai/conversations/${conversationId}`);
  },

  // 5. Courses
  async getCourses() {
    return request('/courses');
  },

  async getCourseDetail(slug: string) {
    return request(`/courses/${slug}`);
  },

  async createCourse(payload: { title: string; slug: string; description: string; thumbnailUrl?: string; category?: string; isPremium?: boolean }) {
    return request('/courses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async addLesson(courseId: string, payload: { title: string; videoUrl: string; isFreePreview?: boolean }) {
    return request(`/courses/${courseId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // 6. Economic Calendar (Real-Time FMP)
  async getEconomicEvents(impact = '', dateFilter = 'today', currency = '') {
    return request(`/calendar?impact=${impact}&dateFilter=${dateFilter}&currency=${currency}`);
  },

  async syncEconomicCalendar() {
    return request('/calendar/sync', { method: 'POST' });
  },

  // 7. IB System (CRM & Landing Page Builder)
  async getIBLeads() {
    return request('/ib/leads');
  },

  async updateLeadStatus(id: string, status: string, notes?: string) {
    return request(`/ib/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  },

  async updateLeadTags(id: string, tags: { name: string; color?: string }[]) {
    return request(`/ib/leads/${id}/tags`, {
      method: 'PATCH',
      body: JSON.stringify({ tags })
    });
  },

  async getIBLandingPages() {
    return request('/ib/landing-pages');
  },

  async createIBLandingPage(payload: { title: string; slug: string; seoDescription?: string; themeConfig?: any; sections?: any }) {
    return request('/ib/landing-pages/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateIBLandingPage(id: string, payload: any) {
    return request(`/ib/landing-pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteIBLandingPage(id: string) {
    return request(`/ib/landing-pages/${id}`, {
      method: 'DELETE'
    });
  },

  // 8. Admin
  async getAdminOverview() {
    return request('/admin/overview');
  },

  async getUsers(page = 1, limit = 15, search = '', role = '', status = '') {
    return request(`/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&role=${role}&status=${status}`);
  },

  async toggleUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') {
    return request(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async resetUserPassword(id: string, newPassword: string) {
    return request(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  },

  async updateUserRole(id: string, role: string) {
    return request(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  },

  async assignKeyToUser(id: string) {
    return request(`/users/${id}/assign-key`, {
      method: 'POST'
    });
  },

  async getAuditLogs(page = 1, limit = 20) {
    return request(`/admin/audit-logs?page=${page}&limit=${limit}`);
  },

  // 9. Auto Update
  async checkUpdate(currentVersion = '1.0.0') {
    return request(`/updates/latest?currentVersion=${currentVersion}`);
  },

  async publishUpdate(payload: { version: string; downloadUrl: string; releaseNotes: string; isMandatory: boolean }) {
    return request('/updates/publish', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
