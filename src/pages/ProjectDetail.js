import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { taskService, overdueService } from '../services/api';
import './ProjectDetail.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = localStorage.getItem('userRole');
  const userId = parseInt(localStorage.getItem('userId'));

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projectData, tasksData] = await Promise.all([
        fetchProject(),
        taskService.getByProject(projectId)
      ]);
      setProject(projectData);
      setTasks(tasksData.data || tasksData);
    } catch (err) {
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    return { id: projectId, name: 'Project ' + projectId };
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const isAdmin = userRole === 'admin';
      const checkResult = await overdueService.canChangeStatus(taskId, newStatus, isAdmin);
      
      if (!checkResult.can_change) {
        setError(checkResult.reason);
        setTimeout(() => setError(''), 3000);
        return;
      }

      await taskService.updateStatus(taskId, newStatus, isAdmin);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'TODO': return 'status-todo';
      case 'IN_PROGRESS': return 'status-progress';
      case 'DONE': return 'status-done';
      case 'OVERDUE': return 'status-overdue';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isMyTask = (task) => {
    return task.assigned_to === userId;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      <header className="header">
        <div className="header-left">
          <Link to="/projects" className="back-link">← Back</Link>
          <h1>{project?.name || 'Project Details'}</h1>
        </div>
        <div className="header-right">
          {userRole === 'admin' && (
            <Link to={`/create-task/${projectId}`} className="btn-new-task">
              + New Task
            </Link>
          )}
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="tasks-container">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found</p>
            {userRole === 'admin' && (
              <Link to={`/create-task/${projectId}`} className="btn-create-task">
                Create first task
              </Link>
            )}
          </div>
        ) : (
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className={!isMyTask(task) && userRole !== 'admin' ? 'hidden-task' : ''}>
                  <td>
                    <div className="task-title">{task.title}</div>
                    <div className="task-description">{task.description}</div>
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span className={task.status === 'OVERDUE' ? 'overdue-date' : ''}>
                      {formatDate(task.due_date)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    {(isMyTask(task) || userRole === 'admin') && (
                      <div className="action-buttons">
                        {task.status !== 'DONE' && task.status !== 'OVERDUE' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                            className="btn-action btn-progress"
                          >
                            Start
                          </button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'DONE')}
                            className="btn-action btn-done"
                          >
                            Done
                          </button>
                        )}
                        {task.status === 'OVERDUE' && userRole === 'admin' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'DONE')}
                            className="btn-action btn-close"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;