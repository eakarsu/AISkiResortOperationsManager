import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            <span className="resort-icon">🏔️</span>
            <h1>Alpine Peak Resort</h1>
          </div>
          <div className="top-bar-right">
            <span className="top-bar-date">{today}</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
