import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

let useDemoMode = true;

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

const demoProjects = [
  { id: 1, name: 'Website Redesign', description: 'Redesign company website', task_count: 3 },
  { id: 2, name: 'Mobile App', description: 'Build mobile application', task_count: 2 },
];

const demoTasks = {
  1: [
    { id: 1, title: 'Design mockups', description: 'Create wireframes', status: 'TODO', priority: 'HIGH', due_date: '2026-04-25', assigned_to: 1, project_id: 1 },
    { id: 2, title: 'Implement header', description: 'Build responsive header', status: 'IN_PROGRESS', priority: 'MEDIUM', due_date: '2026-04-20', assigned_to: 1, project_id: 1 },
    { id: 3, title: 'Old task - OVERDUE', description: 'This should be overdue', status: 'OVERDUE', priority: 'HIGH', due_date: '2026-04-10', assigned_to: 1, project_id: 1 },
  ],
  2: [
    { id: 4, title: 'Setup React Native', description: 'Initialize RN project', status: 'TODO', priority: 'HIGH', due_date: '2026-04-30', assigned_to: 2, project_id: 2 },
    { id: 5, title: 'API integration', description: 'Connect to backend', status: 'TODO', priority: 'MEDIUM', due_date: '2026-05-01', assigned_to: 1, project_id: 2 },
  ],
};

function handleSuccess(response) {
  return response.data;
}

function handleError(error) {
  const message = error.response?.data?.message || error.response?.data?.error || 'An error occurred';
  throw new Error(message);
}

export const authService = {
  login: async (email, password) => {
    if (useDemoMode) {
      if (email === 'admin@demo.com' && password === 'demo123') {
        return { success: true, message: 'Login successful', data: { token: 'admin_token', user_id: 1, username: 'admin', email: 'admin@demo.com', role: 'admin' } };
      }
      if (email === 'user@demo.com' && password === 'demo123') {
        return { success: true, message: 'Login successful', data: { token: 'user_token', user_id: 2, username: 'demo_user', email: 'user@demo.com', role: 'user' } };
      }
      throw new Error('Invalid credentials');
    }
    try {
      const response = await api.post('/auth/login/', { email, password });
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  register: async (name, email, password) => {
    if (useDemoMode) {
      throw new Error('Registration disabled in demo mode');
    }
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
    if (useDemoMode) {
      return { success: true, message: 'Projects fetched successfully', data: demoProjects };
    }
    try {
      const response = await api.get('/projects/');
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  getById: async (id) => {
    if (useDemoMode) {
      const project = demoProjects.find(p => p.id === parseInt(id));
      return { success: true, message: 'Project fetched successfully', data: project };
    }
    try {
      const response = await api.get(`/projects/${id}/`);
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  create: async (projectData) => {
    if (useDemoMode) {
      const newProject = { id: Date.now(), ...projectData, task_count: 0 };
      demoProjects.push(newProject);
      return { success: true, message: 'Project created successfully', data: newProject };
    }
    try {
      const response = await api.post('/projects/', projectData);
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
};

let taskStore = JSON.parse(JSON.stringify(demoTasks));

export const taskService = {
  getByProject: async (projectId) => {
    if (useDemoMode) {
      const tasks = taskStore[projectId] || [];
      return { success: true, message: 'Tasks fetched successfully', data: tasks };
    }
    try {
      const response = await api.get(`/tasks/`, { params: { project_id: projectId } });
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  create: async (taskData) => {
    if (useDemoMode) {
      const newTask = { id: Date.now(), ...taskData, status: 'TODO', created_at: new Date().toISOString() };
      if (!taskStore[taskData.project_id]) {
        taskStore[taskData.project_id] = [];
      }
      taskStore[taskData.project_id].push(newTask);
      return { success: true, message: 'Task created successfully', data: newTask };
    }
    try {
      const response = await api.post('/tasks/', taskData);
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  updateStatus: async (taskId, status, isAdmin = false) => {
    if (useDemoMode) {
      for (const projectId in taskStore) {
        const task = taskStore[projectId].find(t => t.id === taskId);
        if (task) {
          if (task.status === 'OVERDUE' && status === 'IN_PROGRESS') {
            throw new Error('Overdue tasks cannot be moved back to In Progress');
          }
          if (task.status === 'OVERDUE' && status === 'DONE' && !isAdmin) {
            throw new Error('Only Admin can close overdue tasks');
          }
          task.status = status;
          return { success: true, message: 'Task status updated successfully', data: task };
        }
      }
      throw new Error('Task not found');
    }
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
    if (useDemoMode) {
      return { success: true, message: 'No overdue tasks', data: { count: 0, tasks: [] } };
    }
    try {
      const data = projectId ? { project_id: projectId } : {};
      const response = await api.post('/tasks/check-overdue/', data);
      return handleSuccess(response);
    } catch (error) {
      handleError(error);
    }
  },
  canChangeStatus: async (taskId, newStatus, isAdmin = false) => {
    if (useDemoMode) {
      for (const projectId in taskStore) {
        const task = taskStore[projectId].find(t => t.id === taskId);
        if (task) {
          if (task.status === 'OVERDUE' && newStatus === 'IN_PROGRESS') {
            return { success: true, message: '', data: { can_change: false, reason: 'Overdue tasks cannot be moved back to In Progress' } };
          }
          if (task.status === 'OVERDUE' && newStatus === 'DONE' && !isAdmin) {
            return { success: true, message: '', data: { can_change: false, reason: 'Only Admin can close overdue tasks' } };
          }
          return { success: true, message: '', data: { can_change: true, reason: '' } };
        }
      }
      return { success: true, message: '', data: { can_change: true, reason: '' } };
    }
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