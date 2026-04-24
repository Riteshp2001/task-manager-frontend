import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, clearSession, getSession, projectService } from '../services/api';
import './Projects.css';

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const session = getSession();
  const user = session?.user;
  const isAdmin = user?.role === 'admin';
  const totalTasks = projects.reduce((sum, project) => sum + (project.task_count || 0), 0);
  const summaryTitle = isAdmin ? 'Team workspace' : 'Assigned work';
  const summaryCopy = isAdmin
    ? 'Track active projects, keep ownership clear, and step into any board that needs attention.'
    : 'Review the projects that include your tasks and keep progress moving without extra noise.';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore logout failures and clear the local session anyway.
    }

    clearSession();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <header className="workspace-hero">
        <div className="workspace-copy">
          <p className="section-label">Internal workspace</p>
          <h1>{summaryTitle}</h1>
          <p className="section-copy">{summaryCopy}</p>
        </div>
        <div className="workspace-actions">
          <div className="user-chip">
            <strong>{user?.name}</strong>
            <span>{isAdmin ? 'Admin access' : 'Member access'}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <section className="workspace-stats" aria-label="Workspace summary">
        <article className="stat-card">
          <span className="stat-label">Visible projects</span>
          <strong>{projects.length}</strong>
          <p>{isAdmin ? 'Everything currently in scope.' : 'Projects with tasks assigned to you.'}</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">Visible tasks</span>
          <strong>{totalTasks}</strong>
          <p>{isAdmin ? 'Across all active projects.' : 'Tasks surfaced through your assignments.'}</p>
        </article>
        <article className="stat-card">
          <span className="stat-label">Working mode</span>
          <strong>{isAdmin ? 'Manage' : 'Execute'}</strong>
          <p>{isAdmin ? 'Create and close work as needed.' : 'Update status on the work you own.'}</p>
        </article>
      </section>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p>
              {user?.role === 'admin'
                ? 'Create a project from the backend API or seed data to start assigning tasks.'
                : 'No tasks have been assigned to you yet, so no projects are visible.'}
            </p>
          </div>
        ) : (
          projects.map((project, index) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
              <div className="project-card-top">
                <span className="project-index">Project {index + 1}</span>
                <span className="project-count">
                  {project.task_count || 0} task{project.task_count === 1 ? '' : 's'}
                </span>
              </div>
              <h3>{project.name}</h3>
              <p>{project.description || 'No description added yet.'}</p>
              <div className="project-meta">
                <span>{isAdmin ? 'Open board' : 'View tasks'}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Projects;
