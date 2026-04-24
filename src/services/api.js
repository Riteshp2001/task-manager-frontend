import axios from 'axios';

const isLocalHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const API_BASE_URL =
  process.env.REACT_APP_API_URL || (isLocalHost ? 'http://127.0.0.1:8000' : '');
const SESSION_KEY = 'taskManagerSession';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getSession() {
  try {
    const rawSession = localStorage.getItem(SESSION_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch (error) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

api.interceptors.request.use((config) => {
  const session = getSession();

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

function unwrapResponse(response) {
  return response.data?.data ?? {};
}

function ensureApiConfigured() {
  if (!API_BASE_URL) {
    throw new Error('API URL is not configured. Set REACT_APP_API_URL for this environment.');
  }
}

function throwNormalizedError(error) {
  const validationErrors = error.response?.data?.errors;
  const firstFieldError = validationErrors
    ? Object.values(validationErrors).flat()[0]
    : null;

  const message =
    firstFieldError ||
    error.response?.data?.message ||
    error.message ||
    'Something went wrong.';

  throw new Error(message);
}

export const authService = {
  login: async (email, password) => {
    try {
      ensureApiConfigured();
      const response = await api.post('/auth/login', { email, password });
      return unwrapResponse(response);
    } catch (error) {
      throwNormalizedError(error);
    }
  },
  register: async (name, email, password) => {
    try {
      ensureApiConfigured();
      const response = await api.post('/auth/register', { name, email, password });
      return unwrapResponse(response);
    } catch (error) {
      throwNormalizedError(error);
    }
  },
  me: async () => {
    try {
      ensureApiConfigured();
      const response = await api.get('/auth/me');
      return unwrapResponse(response);
    } catch (error) {
      throwNormalizedError(error);
    }
  },
  logout: async () => {
    try {
      ensureApiConfigured();
      const response = await api.post('/auth/logout');
      return unwrapResponse(response);
    } catch (error) {
      throwNormalizedError(error);
    }
  },
};

export const projectService = {
  getAll: async () => {
    try {
      ensureApiConfigured();
      const response = await api.get('/projects');
      return unwrapResponse(response).projects || [];
    } catch (error) {
      throwNormalizedError(error);
    }
  },
  getById: async (id) => {
    try {
      ensureApiConfigured();
      const response = await api.get(`/projects/${id}`);
      return unwrapResponse(response).project;
    } catch (error) {
      throwNormalizedError(error);
    }
  },
  create: async (projectData) => {
    try {
      ensureApiConfigured();
      const response = await api.post('/projects', projectData);
      return unwrapResponse(response).project;
    } catch (error) {
      throwNormalizedError(error);
    }
  },
};

export const taskService = {
  getByProject: async (projectId) => {
    try {
      ensureApiConfigured();
      const response = await api.get(`/projects/${projectId}/tasks`);
      return unwrapResponse(response).tasks || [];
    } catch (error) {
      throwNormalizedError(error);
    }
  },
  create: async (projectId, taskData) => {
    try {
      ensureApiConfigured();
      const response = await api.post(`/projects/${projectId}/tasks`, taskData);
      return unwrapResponse(response).task;
    } catch (error) {
      throwNormalizedError(error);
    }
  },
  updateStatus: async (taskId, status) => {
    try {
      ensureApiConfigured();
      const response = await api.patch(`/tasks/${taskId}/status`, { status });
      return unwrapResponse(response).task;
    } catch (error) {
      throwNormalizedError(error);
    }
  },
};

export const userService = {
  getAssignableUsers: async () => {
    try {
      ensureApiConfigured();
      const response = await api.get('/users/assignees');
      return unwrapResponse(response).users || [];
    } catch (error) {
      throwNormalizedError(error);
    }
  },
};

export default api;
