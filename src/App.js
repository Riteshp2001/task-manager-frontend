import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import CreateTask from './pages/CreateTask';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/projects" element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          } />
          <Route path="/projects/:projectId" element={
            <PrivateRoute>
              <ProjectDetail />
            </PrivateRoute>
          } />
          <Route path="/create-task/:projectId" element={
            <PrivateRoute>
              <CreateTask />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/projects" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;