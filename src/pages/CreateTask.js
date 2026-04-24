import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSession, taskService, userService } from '../services/api';
import './CreateTask.css';

function CreateTask() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const user = session?.user;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    due_date: '',
    assigned_to: '',
  });
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const selectedAssignee = assignableUsers.find(
    (item) => String(item.id) === String(formData.assigned_to)
  );

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate(`/projects/${projectId}`);
      return;
    }

    loadUsers();
  }, [projectId, navigate, user?.role]);

  const loadUsers = async () => {
    try {
      const response = await userService.getAssignableUsers();
      setAssignableUsers(response);
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        due_date: new Date(formData.due_date).toISOString(),
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null,
      };

      await taskService.create(projectId, taskData);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-task-container">
      <header className="task-page-hero">
        <div className="task-page-copy">
          <Link to={`/projects/${projectId}`} className="back-link">
            ← Back
          </Link>
          <p className="page-label">Task setup</p>
          <h1>Create Task</h1>
          <p className="page-copy">
            Keep it short, assign it clearly, and set a due date that the team can act on.
          </p>
        </div>
        <div className="task-page-note">
          <span>Summary</span>
          <strong>{selectedAssignee ? selectedAssignee.name : 'Unassigned'}</strong>
          <p>
            {formData.due_date
              ? `Due ${new Date(formData.due_date).toLocaleString()}`
              : 'Pick a due date before saving the task.'}
          </p>
        </div>
      </header>

      <div className="form-container">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date *</label>
              <input
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{loadingUsers ? 'Assign To (loading...)' : 'Assign To'}</label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              disabled={loadingUsers}
            >
              <option value="">Select a member</option>
              {assignableUsers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
            <Link to={`/projects/${projectId}`} className="btn-cancel">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTask;
