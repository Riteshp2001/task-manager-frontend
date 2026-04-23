import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.role);
      localStorage.setItem('userId', response.user_id);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    try {
      const demoEmail = role === 'admin' ? 'admin@demo.com' : 'user@demo.com';
      const response = await authService.login(demoEmail, 'demo123');
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.role);
      localStorage.setItem('userId', response.user_id);
      navigate('/projects');
    } catch (err) {
      setError('Demo login failed. Please use the credentials provided.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Task Manager</h1>
        <p className="subtitle">Sign in to your account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="demo-section">
          <p>Or try with demo account:</p>
          <div className="demo-buttons">
            <button 
              onClick={() => handleDemoLogin('admin')} 
              className="btn-demo-admin"
              disabled={loading}
            >
              Admin Demo
            </button>
            <button 
              onClick={() => handleDemoLogin('user')} 
              className="btn-demo-user"
              disabled={loading}
            >
              User Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;