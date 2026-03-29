const API_BASE_URL = 'http://localhost:3000'; // Updated port

// General fetch wrapper for JSON requests
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP Error ${response.status}`);
  }
  return data;
}

export const authAPI = {
  signup: (userData) => fetchAPI('/api/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => fetchAPI('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  forgotPassword: (email) => fetchAPI('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOTP: (email, otp) => fetchAPI('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resetPassword: (resetToken, newPassword) => fetchAPI('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ resetToken, newPassword }) }),
  getCurrentUser: () => fetchAPI('/api/auth/me', { method: 'GET' }),
  getUsers: () => fetchAPI('/api/users', { method: 'GET' }),
  addUser: (userData) => fetchAPI('/api/users/add-user', { method: 'POST', body: JSON.stringify(userData) }),
};
