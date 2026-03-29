const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

export function getStoredAuth() {
  return {
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user'),
  };
}

export function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function request(endpoint, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();
    }

    throw new Error(payload?.message || payload?.error || `Request failed with status ${response.status}`);
  }

  return payload;
}

export const authAPI = {
  signup: (userData) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  login: (credentials) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  forgotPassword: (email) =>
    request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  verifyOTP: (email, otp) =>
    request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),
  resetPassword: (resetToken, newPassword) =>
    request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    }),
  getCurrentUser: () => request('/api/auth/me'),
};

export const usersAPI = {
  getAllUsers: () => request('/api/users'),
  addUser: (userData) =>
    request('/api/users/add-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  sendPassword: (userId) =>
    request('/api/users/send-password', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
};

export const approvalRulesAPI = {
  createRule: (data) =>
    request('/api/approval-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getUserRules: () => request('/api/approval-rules'),
  updateRule: (id, data) =>
    request(`/api/approval-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteRule: (id) =>
    request(`/api/approval-rules/${id}`, {
      method: 'DELETE',
    }),
};

authAPI.addUser = usersAPI.addUser;
authAPI.sendPassword = usersAPI.sendPassword;

export const approvalAPI = {
  createRule: approvalRulesAPI.createRule,
  getAllRules: approvalRulesAPI.getUserRules,
  updateRule: approvalRulesAPI.updateRule,
  deleteRule: approvalRulesAPI.deleteRule,
};

export const transactionsAPI = {
  createTransaction: (data) =>
    request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getUserTransactions: () => request('/api/transactions'),
  getTransactionById: (id) => request(`/api/transactions/${id}`),
  getUserTransactionHistory: () => request('/api/transactions/history/all'),
  getPendingApprovals: () => request('/api/transactions/approvals/pending'),
  getAllTransactions: (status, userId) => {
    const params = new URLSearchParams();

    if (status) params.set('status', status);
    if (userId) params.set('userId', userId);

    const query = params.toString();
    return request(`/api/transactions/admin/all-transactions${query ? `?${query}` : ''}`);
  },
  updateTransaction: (id, data) =>
    request(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  submitTransaction: (id) =>
    request(`/api/transactions/${id}/submit`, {
      method: 'POST',
    }),
  approveTransaction: (id, comments) =>
    request(`/api/transactions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    }),
  rejectTransaction: (id, comments) =>
    request(`/api/transactions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    }),
  getApprovalHistory: (id) => request(`/api/transactions/${id}/approvals/history`),
  deleteTransaction: (id) =>
    request(`/api/transactions/${id}`, {
      method: 'DELETE',
    }),
  uploadAttachment: (transactionId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return request(`/api/transactions/${transactionId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  },
};
