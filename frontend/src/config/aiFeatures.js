export const aiFeatures = {
  dynamicPricing: {
    title: 'Dynamic Pricing',
    endpoint: 'dynamic-pricing',
    icon: '💰',
    description: 'AI-powered dynamic lift ticket pricing based on real-time conditions, demand, and weather forecasts',
    contextInfo: 'Analyzes current lift ticket sales, season pass data, weather forecasts, historical demand patterns, and special events to recommend optimal pricing.',
    inputFields: [
      { key: 'date', label: 'Target Date', type: 'date' },
      { key: 'event', label: 'Special Event', type: 'text' }
    ]
  },
  snowConditions: {
    title: 'Snow Conditions Report',
    endpoint: 'snow-conditions',
    icon: '🌨️',
    description: 'AI-generated comprehensive snow condition analysis and forecast',
    contextInfo: 'Combines data from weather stations, snow reports, trail conditions, and historical patterns to generate detailed snow condition analysis.',
    inputFields: [
      { key: 'detail_level', label: 'Detail Level', type: 'select', options: ['Summary', 'Detailed', 'Expert'] }
    ]
  },
  groomingOptimization: {
    title: 'Grooming Optimization',
    endpoint: 'grooming-optimization',
    icon: '🚜',
    description: 'AI-optimized grooming schedule based on trail conditions, weather forecast, and guest patterns',
    contextInfo: 'Uses trail conditions, snow depth data, weather forecasts, guest traffic patterns, and equipment availability to create optimal grooming schedules.',
    inputFields: [
      { key: 'date', label: 'Schedule Date', type: 'date' },
      { key: 'priority', label: 'Priority Focus', type: 'select', options: ['Guest Experience', 'Cost Efficiency', 'Safety'] }
    ]
  },
  guestRecommendations: {
    title: 'Guest Recommendations',
    endpoint: 'guest-recommendations',
    icon: '🎯',
    description: 'Personalized AI recommendations for guest experiences based on conditions and preferences',
    contextInfo: 'Analyzes current trail conditions, weather, crowd levels, events, dining options, and lesson availability to generate personalized recommendations.',
    inputFields: [
      { key: 'skill_level', label: 'Skill Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { key: 'group_type', label: 'Group Type', type: 'select', options: ['Solo', 'Couple', 'Family', 'Friends Group'] },
      { key: 'interests', label: 'Interests', type: 'text' }
    ]
  },
  marketingContent: {
    title: 'Marketing Content',
    endpoint: 'marketing-content',
    icon: '📢',
    description: 'AI-generated marketing campaign content for resort promotions',
    contextInfo: 'Uses current snow conditions, upcoming events, special offers, and resort highlights to generate compelling marketing content.',
    inputFields: [
      { key: 'campaign_type', label: 'Campaign Type', type: 'select', options: ['Social Media', 'Email Newsletter', 'Print Ad', 'Website Banner', 'Video Script'] },
      { key: 'target_audience', label: 'Target Audience', type: 'select', options: ['Families', 'Young Adults', 'Seniors', 'Locals', 'Tourists'] },
      { key: 'theme', label: 'Theme/Topic', type: 'text' }
    ]
  },
  staffingPrediction: {
    title: 'Staffing Prediction',
    endpoint: 'staffing-prediction',
    icon: '📊',
    description: 'AI-powered staffing demand prediction based on bookings, weather, and historical data',
    contextInfo: 'Analyzes booking trends, weather forecasts, historical visitor data, events calendar, and current staffing levels to predict staffing needs.',
    inputFields: [
      { key: 'date', label: 'Prediction Date', type: 'date' },
      { key: 'department', label: 'Department', type: 'select', options: ['All', 'Lifts', 'Patrol', 'Ski School', 'Food Service', 'Retail', 'Maintenance', 'Guest Services'] }
    ]
  }
};
