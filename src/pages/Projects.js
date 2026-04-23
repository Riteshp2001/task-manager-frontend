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
      <header className="header">
        <div className="header-left">
          <p className="section-label">Dashboard</p>
          <h1>Projects</h1>
          <p className="section-copy">
            {user?.role === 'admin'
              ? 'Review every project, assign tasks, and monitor overdue work.'
              : 'Open any project below to see the tasks assigned to you.'}
          </p>
        </div>
        <div className="header-right">
          <div className="user-chip">
            <strong>{user?.name}</strong>
            <span>{user?.role === 'admin' ? 'Admin' : 'Member'}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

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
          projects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
              <div className="project-card-top">
                <span className="project-count">
                  {project.task_count || 0} task{project.task_count === 1 ? '' : 's'}
                </span>
              </div>
              <h3>{project.name}</h3>
              <p>{project.description || 'No description added yet.'}</p>
              <div className="project-meta">
                <span>Open project</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Projects;
