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
  const isAdmin = user?.role === 'admin';
  const openTasks = tasks.filter((task) => task.status !== 'DONE').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'IN_PROGRESS').length;
  const overdueTasks = tasks.filter((task) => task.status === 'OVERDUE').length;
  const completedTasks = tasks.filter((task) => task.status === 'DONE').length;

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const projectData = await projectService.getById(projectId);
      setProject(projectData);

      const tasksData = await taskService.getByProject(projectId);
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
      const updatedTask = await taskService.updateStatus(taskId, newStatus);

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
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
      <header className="detail-hero">
        <div className="detail-copy">
          <Link to="/projects" className="back-link">
            ← Back
          </Link>
          <p className="detail-label">Project board</p>
          <h1>{project?.name || 'Project details'}</h1>
          <p className="project-summary">
            {project?.description || 'No description added for this project.'}
          </p>
        </div>
        <div className="detail-actions">
          {isAdmin && (
            <Link to={`/create-task/${projectId}`} className="btn-new-task">
              Create task
            </Link>
          )}
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <section className="detail-stats" aria-label="Project summary">
        <article className="detail-stat">
          <span>Open</span>
          <strong>{openTasks}</strong>
        </article>
        <article className="detail-stat">
          <span>In progress</span>
          <strong>{inProgressTasks}</strong>
        </article>
        <article className="detail-stat">
          <span>Overdue</span>
          <strong>{overdueTasks}</strong>
        </article>
        <article className="detail-stat">
          <span>Completed</span>
          <strong>{completedTasks}</strong>
        </article>
      </section>

      <div className="tasks-container">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>
              {isAdmin
                ? 'Create the first task for this project.'
                : 'No tasks are currently assigned to you in this project.'}
            </p>
            {isAdmin && (
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
                    <div className="task-description">
                      {task.description || 'No description added for this task.'}
                    </div>
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
                      task.status === 'OVERDUE' && !isAdmin ? (
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
