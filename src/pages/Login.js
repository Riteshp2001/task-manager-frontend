import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, setSession } from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      setSession(response.token, response.user);
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <p className="eyebrow">Task & Project Management System</p>
          <h1>Sign in</h1>
          <p className="subtitle">
            Use one of the test accounts below to explore the app.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="credentials-card">
          <p className="credentials-title">Test credentials</p>
          <div className="credentials-row">
            <span>Admin</span>
            <code>admin@example.com / password123</code>
          </div>
          <div className="credentials-row">
            <span>Member</span>
            <code>member@example.com / password123</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
