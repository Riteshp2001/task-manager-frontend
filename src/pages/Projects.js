import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/api';
import './Projects.css';

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data || response);
    } catch (err) {
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <header className="header">
        <div className="header-left">
          <h1>Projects</h1>
        </div>
        <div className="header-right">
          <span className="user-role">{userRole === 'admin' ? 'Admin' : 'Member'}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found</p>
            {userRole === 'admin' && (
              <p>Create a new project </p>
            )}
          </div>
        ) : (
          projects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
              <h3>{project.name}</h3>
              <p>{project.description || 'No description'}</p>
              <div className="project-meta">
                <span>{project.task_count || 0} tasks</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Projects;