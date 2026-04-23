import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function extractData(response) {
  return response.data.data || response.data;
}

function handleSuccess(response) {
  return response.data;
}

function handleError(error) {
  const message = error.response?.data?.message || error.response?.data?.error || 'An error occurred';
  throw new Error(message);
}

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  register: async (name, email, password) => {
    try {
      const response = await api.post('/auth/register/', { username: email.split('@')[0], email, password, name });
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
};

export const projectService = {
  getAll: async () => {
    try {
      const response = await api.get('/projects/');
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}/`);
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  create: async (projectData) => {
    try {
      const response = await api.post('/projects/', projectData);
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
};

export const taskService = {
  getByProject: async (projectId) => {
    try {
      const response = await api.get(`/tasks/`, { params: { project_id: projectId } });
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  create: async (taskData) => {
    try {
      const response = await api.post('/tasks/', taskData);
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  updateStatus: async (taskId, status, isAdmin = false) => {
    try {
      const response = await api.put(`/tasks/${taskId}/status/`, { status });
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
};

export const overdueService = {
  checkOverdue: async (projectId = null) => {
    try {
      const data = projectId ? { project_id: projectId } : {};
      const response = await api.post('/tasks/check-overdue/', data);
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  canChangeStatus: async (taskId, newStatus, isAdmin = false) => {
    try {
      const response = await api.post('/tasks/can-change/', {
        task_id: taskId,
        new_status: newStatus,
        is_admin: isAdmin,
      });
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
};

export default api;