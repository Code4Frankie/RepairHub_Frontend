const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || null;
  }
}

const TOKEN_KEY = 'repairhub_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * @param {string} path - e.g. '/repair-requests'
 * @param {object} opts - { method, body, isFormData, query }
 */
export async function request(path, opts = {}) {
  const { method = 'GET', body, isFormData = false, query } = opts;

  let url = `${API_BASE_URL}${path}`;
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    );
    if ([...qs].length) url += `?${qs}`;
  }

  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError(
      'Could not reach the server. Check the API is running and VITE_API_BASE_URL in .env is correct.',
      0
    );
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(`Server returned an unexpected response (${res.status}).`, res.status);
  }

  if (!json.success) {
    if (res.status === 401) clearToken(); // expired/invalid — next guarded route will redirect to login
    throw new ApiError(json.message || 'Request failed', res.status, json.errors);
  }

  return { data: json.data, meta: json.meta, message: json.message };
}

export const api = {
  get: (path, query) => request(path, { method: 'GET', query }),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  patch: (path, body, opts = {}) => request(path, { method: 'PATCH', body, ...opts }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
