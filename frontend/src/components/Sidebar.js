import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const navSections = [
  {
    title: 'Core Operations',
    items: [
      { path: '/lift-tickets', icon: '🎫', label: 'Lift Tickets' },
      { path: '/season-passes', icon: '🏔️', label: 'Season Passes' },
      { path: '/lifts', icon: '🚡', label: 'Lift Operations' },
      { path: '/trails', icon: '⛷️', label: 'Trail Management' },
      { path: '/snowmaking', icon: '❄️', label: 'Snowmaking' },
      { path: '/snow-reports', icon: '🌨️', label: 'Snow Reports' },
    ]
  },
  {
    title: 'Guest Services',
    items: [
      { path: '/patrol-incidents', icon: '🚑', label: 'Ski Patrol' },
      { path: '/rental-inventory', icon: '🎿', label: 'Rental Shop' },
      { path: '/lessons', icon: '🏫', label: 'Ski School' },
      { path: '/instructors', icon: '👨‍🏫', label: 'Instructors' },
      { path: '/childcare', icon: '👶', label: 'Childcare' },
      { path: '/lost-found', icon: '🔍', label: 'Lost & Found' },
      { path: '/guest-services', icon: '🛎️', label: 'Guest Services' },
      { path: '/events', icon: '🎉', label: 'Events' },
      { path: '/accommodations', icon: '🏨', label: 'Accommodations' },
      { path: '/shuttles', icon: '🚐', label: 'Shuttles' },
      { path: '/parking', icon: '🅿️', label: 'Parking' },
      { path: '/food-beverage', icon: '🍽️', label: 'Food & Beverage' },
      { path: '/retail', icon: '🛍️', label: 'Retail' },
    ]
  },
  {
    title: 'Operations & Safety',
    items: [
      { path: '/equipment-maintenance', icon: '🔧', label: 'Equipment Maintenance' },
      { path: '/rfid-access', icon: '📡', label: 'RFID Access' },
      { path: '/weather-stations', icon: '🌡️', label: 'Weather Stations' },
      { path: '/avalanche-control', icon: '🏔️', label: 'Avalanche Control' },
      { path: '/staffing', icon: '👥', label: 'Staffing' },
      { path: '/terrain-park', icon: '🏂', label: 'Terrain Park' },
    ]
  },
  {
    title: 'AI Intelligence',
    isAI: true,
    items: [
      { path: '/ai/dynamic-pricing', icon: '💰', label: 'Dynamic Pricing' },
      { path: '/ai/snow-conditions', icon: '🌨️', label: 'Snow Conditions' },
      { path: '/ai/grooming-optimization', icon: '🚜', label: 'Grooming Optimization' },
      { path: '/ai/guest-recommendations', icon: '🎯', label: 'Guest Recommendations' },
      { path: '/ai/marketing-content', icon: '📢', label: 'Marketing Content' },
      { path: '/ai/staffing-prediction', icon: '📊', label: 'Staffing Prediction' },
    ]
  }
];

const Sidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState({});

  const toggleSection = (title) => {
    setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header" onClick={() => navigate('/dashboard')}>
        <span className="sidebar-logo">🏔️</span>
        <div>
          <h2 className="sidebar-title">Alpine Peak</h2>
          <p className="sidebar-subtitle">Operations Manager</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link dashboard-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-link-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>

        {navSections.map(section => (
          <div key={section.title} className={`sidebar-section ${section.isAI ? 'ai-section' : ''}`}>
            <button className="section-header" onClick={() => toggleSection(section.title)}>
              <span>{section.title}</span>
              <span className={`chevron ${collapsed[section.title] ? 'collapsed' : ''}`}>&#9662;</span>
            </button>
            {!collapsed[section.title] && (
              <div className="section-items">
                {section.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${section.isAI ? 'ai-link' : ''}`}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
