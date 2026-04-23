import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSession, projectService, taskService } from '../services/api';
import './ProjectDetail.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const session = getSession();
  const user = session?.user;

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projectData, tasksData] = await Promise.all([
        projectService.getById(projectId),
        taskService.getByProject(projectId),
      ]);

      setProject(projectData);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message || 'Failed to load project data.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setError('');

    try {
      await taskService.updateStatus(taskId, newStatus);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'TODO':
        return 'status-todo';
      case 'IN_PROGRESS':
        return 'status-progress';
      case 'DONE':
        return 'status-done';
      case 'OVERDUE':
        return 'status-overdue';
      default:
        return '';
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getActionLabel = (task) => {
    if (task.status === 'TODO') {
      return 'Start';
    }

    if (task.status === 'IN_PROGRESS') {
      return 'Mark done';
    }

    if (task.status === 'OVERDUE') {
      return 'Close overdue';
    }

    return '';
  };

  const getNextStatus = (task) => {
    if (task.status === 'TODO') {
      return 'IN_PROGRESS';
    }

    return 'DONE';
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
          <Link to="/projects" className="back-link">
            ← Back
          </Link>
          <h1>{project?.name || 'Project details'}</h1>
          <p className="project-summary">
            {project?.description || 'No description added for this project.'}
          </p>
        </div>
        <div className="header-right">
          {user?.role === 'admin' && (
            <Link to={`/create-task/${projectId}`} className="btn-new-task">
              Create task
            </Link>
          )}
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="tasks-container">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>
              {user?.role === 'admin'
                ? 'Create the first task for this project.'
                : 'No tasks are currently assigned to you in this project.'}
            </p>
            {user?.role === 'admin' && (
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
                <tr key={task.id}>
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
                    {task.status !== 'DONE' ? (
                      task.status === 'OVERDUE' && user?.role !== 'admin' ? (
                        <span className="locked-note">Admin only</span>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(task.id, getNextStatus(task))}
                          className={`btn-action ${
                            task.status === 'OVERDUE'
                              ? 'btn-close'
                              : task.status === 'IN_PROGRESS'
                                ? 'btn-done'
                                : 'btn-progress'
                          }`}
                        >
                          {getActionLabel(task)}
                        </button>
                      )
                    ) : (
                      <span className="locked-note done-note">Completed</span>
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
