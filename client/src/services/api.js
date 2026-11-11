const API_BASE = '/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('nexus_token');
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP error! status: ${res.status}`);
  }
  return data;
};

export const api = {
  // Auth
  register: (payload) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  login: (payload) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    }).then(handleResponse),

  // Posts
  getPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/posts${query ? `?${query}` : ''}`, {
      headers: getHeaders()
    }).then(handleResponse);
  },

  getPostById: (id) =>
    fetch(`${API_BASE}/posts/${id}`, {
      headers: getHeaders()
    }).then(handleResponse),

  createPost: (data, isFormData = false) =>
    fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data)
    }).then(handleResponse),

  toggleLike: (id) =>
    fetch(`${API_BASE}/posts/${id}/like`, {
      method: 'PUT',
      headers: getHeaders()
    }).then(handleResponse),

  addComment: (id, text) =>
    fetch(`${API_BASE}/posts/${id}/comment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    }).then(handleResponse),

  deleteComment: (postId, commentId) =>
    fetch(`${API_BASE}/posts/${postId}/comment/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  deletePost: (id) =>
    fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  // Users
  getUserProfile: (username) =>
    fetch(`${API_BASE}/users/${username}`, {
      headers: getHeaders()
    }).then(handleResponse),

  updateProfile: (data, isFormData = false) =>
    fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data)
    }).then(handleResponse),

  toggleFollow: (userId) =>
    fetch(`${API_BASE}/users/${userId}/follow`, {
      method: 'PUT',
      headers: getHeaders()
    }).then(handleResponse),

  getSuggestions: () =>
    fetch(`${API_BASE}/users/suggestions`, {
      headers: getHeaders()
    }).then(handleResponse)
};

