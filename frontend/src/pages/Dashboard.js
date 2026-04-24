import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const sections = [
  {
    title: 'Core Operations',
    cards: [
      { icon: '🎫', title: 'Lift Tickets', desc: 'Manage daily lift ticket sales and access', path: '/lift-tickets' },
      { icon: '🏔️', title: 'Season Passes', desc: 'Season pass management and holder tracking', path: '/season-passes' },
      { icon: '🚡', title: 'Lift Operations', desc: 'Monitor and manage all lift operations', path: '/lifts' },
      { icon: '⛷️', title: 'Trail Management', desc: 'Trail conditions, grooming, and status', path: '/trails' },
      { icon: '❄️', title: 'Snowmaking', desc: 'Snowmaking operations and equipment', path: '/snowmaking' },
      { icon: '🌨️', title: 'Snow Reports', desc: 'Daily snow and weather condition reports', path: '/snow-reports' },
    ]
  },
  {
    title: 'Guest Services',
    cards: [
      { icon: '🚑', title: 'Ski Patrol', desc: 'Patrol incidents, injuries, and safety', path: '/patrol-incidents' },
      { icon: '🎿', title: 'Rental Shop', desc: 'Rental equipment inventory management', path: '/rental-inventory' },
      { icon: '🏫', title: 'Ski School', desc: 'Ski and snowboard lesson scheduling', path: '/lessons' },
      { icon: '👨‍🏫', title: 'Instructors', desc: 'Instructor profiles and availability', path: '/instructors' },
      { icon: '👶', title: 'Childcare', desc: "Children's care and activity programs", path: '/childcare' },
      { icon: '🔍', title: 'Lost & Found', desc: 'Track lost and found items', path: '/lost-found' },
      { icon: '🛎️', title: 'Guest Services', desc: 'Guest requests and service management', path: '/guest-services' },
      { icon: '🎉', title: 'Events', desc: 'Resort events and activities calendar', path: '/events' },
      { icon: '🏨', title: 'Accommodations', desc: 'Lodging and accommodation bookings', path: '/accommodations' },
      { icon: '🚐', title: 'Shuttles', desc: 'Shuttle routes and transportation', path: '/shuttles' },
      { icon: '🅿️', title: 'Parking', desc: 'Parking lot capacity and management', path: '/parking' },
      { icon: '🍽️', title: 'Food & Beverage', desc: 'Restaurant and dining operations', path: '/food-beverage' },
      { icon: '🛍️', title: 'Retail', desc: 'Retail store sales and inventory', path: '/retail' },
    ]
  },
  {
    title: 'Operations & Safety',
    cards: [
      { icon: '🔧', title: 'Equipment Maintenance', desc: 'Maintenance scheduling and tracking', path: '/equipment-maintenance' },
      { icon: '📡', title: 'RFID Access', desc: 'RFID card access monitoring and logs', path: '/rfid-access' },
      { icon: '🌡️', title: 'Weather Stations', desc: 'Real-time weather station data', path: '/weather-stations' },
      { icon: '🏔️', title: 'Avalanche Control', desc: 'Avalanche risk and control operations', path: '/avalanche-control' },
      { icon: '👥', title: 'Staffing', desc: 'Staff scheduling and shift management', path: '/staffing' },
      { icon: '🏂', title: 'Terrain Park', desc: 'Terrain park features and inspections', path: '/terrain-park' },
    ]
  }
];

const aiCards = [
  { icon: '💰', title: 'Dynamic Pricing', desc: 'AI-powered dynamic lift ticket pricing', path: '/ai/dynamic-pricing' },
  { icon: '🌨️', title: 'Snow Conditions', desc: 'AI snow condition analysis and forecast', path: '/ai/snow-conditions' },
  { icon: '🚜', title: 'Grooming Optimization', desc: 'AI-optimized grooming schedules', path: '/ai/grooming-optimization' },
  { icon: '🎯', title: 'Guest Recommendations', desc: 'Personalized AI guest recommendations', path: '/ai/guest-recommendations' },
  { icon: '📢', title: 'Marketing Content', desc: 'AI-generated marketing campaigns', path: '/ai/marketing-content' },
  { icon: '📊', title: 'Staffing Prediction', desc: 'AI staffing demand predictions', path: '/ai/staffing-prediction' },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <h1>Operations Dashboard</h1>
        <p>Manage all resort operations from a single view</p>
      </div>

      {sections.map(section => (
        <div key={section.title} className="dashboard-section">
          <h2 className="section-title">{section.title}</h2>
          <div className="dashboard-grid">
            {section.cards.map(card => (
              <div key={card.path} className="dashboard-card" onClick={() => navigate(card.path)}>
                <div className="card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="dashboard-section ai-section">
        <div className="ai-section-header">
          <h2 className="section-title ai-section-title">
            <span>&#10024;</span> AI Intelligence
          </h2>
          <span className="ai-powered-badge">Powered by AI</span>
        </div>
        <div className="dashboard-grid">
          {aiCards.map(card => (
            <div key={card.path} className="dashboard-card ai-card" onClick={() => navigate(card.path)}>
              <div className="card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <div className="ai-card-badge">AI</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
