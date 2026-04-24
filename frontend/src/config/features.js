export const features = {
  liftTickets: {
    title: 'Lift Tickets',
    apiResource: 'lift-tickets',
    icon: '🎫',
    description: 'Manage daily lift ticket sales and access',
    searchField: 'guest_name',
    columns: [
      { key: 'guest_name', label: 'Guest Name' },
      { key: 'ticket_type', label: 'Ticket Type' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'valid_date', label: 'Valid Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'payment_method', label: 'Payment' }
    ],
    formFields: [
      { key: 'guest_name', label: 'Guest Name', type: 'text' },
      { key: 'ticket_type', label: 'Ticket Type', type: 'select', options: ['Day Pass', 'Half Day', 'Night', 'Multi-Day'] },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'purchase_date', label: 'Purchase Date', type: 'date' },
      { key: 'valid_date', label: 'Valid Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Used', 'Expired', 'Refunded'] },
      { key: 'payment_method', label: 'Payment Method', type: 'select', options: ['Credit Card', 'Cash', 'Mobile'] }
    ]
  },
  seasonPasses: {
    title: 'Season Passes',
    apiResource: 'season-passes',
    icon: '🏔️',
    description: 'Season pass management and holder tracking',
    searchField: 'holder_name',
    columns: [
      { key: 'holder_name', label: 'Holder Name' },
      { key: 'email', label: 'Email' },
      { key: 'pass_type', label: 'Pass Type' },
      { key: 'season', label: 'Season' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    formFields: [
      { key: 'holder_name', label: 'Holder Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'pass_type', label: 'Pass Type', type: 'select', options: ['Adult', 'Senior', 'Child', 'Student', 'Family'] },
      { key: 'season', label: 'Season', type: 'text' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'photo_url', label: 'Photo URL', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Suspended', 'Expired'] }
    ]
  },
  lifts: {
    title: 'Lift Operations',
    apiResource: 'lifts',
    icon: '🚡',
    description: 'Monitor and manage all lift operations',
    searchField: 'name',
    columns: [
      { key: 'name', label: 'Lift Name' },
      { key: 'type', label: 'Type' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'wait_time', label: 'Wait Time' },
      { key: 'vertical_rise', label: 'Vertical Rise' }
    ],
    formFields: [
      { key: 'name', label: 'Lift Name', type: 'text' },
      { key: 'type', label: 'Type', type: 'select', options: ['Chairlift', 'Gondola', 'T-Bar', 'Magic Carpet', 'Surface Lift'] },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Operating', 'On Hold', 'Closed', 'Maintenance'] },
      { key: 'wait_time', label: 'Wait Time (min)', type: 'number' },
      { key: 'vertical_rise', label: 'Vertical Rise (ft)', type: 'number' },
      { key: 'length', label: 'Length (ft)', type: 'number' },
      { key: 'speed', label: 'Speed (mph)', type: 'number' },
      { key: 'last_maintenance', label: 'Last Maintenance', type: 'date' }
    ]
  },
  trails: {
    title: 'Trail Management',
    apiResource: 'trails',
    icon: '⛷️',
    description: 'Trail conditions, grooming, and status updates',
    searchField: 'name',
    columns: [
      { key: 'name', label: 'Trail Name' },
      { key: 'difficulty', label: 'Difficulty', type: 'status' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'grooming_status', label: 'Grooming', type: 'status' },
      { key: 'length', label: 'Length' },
      { key: 'conditions', label: 'Conditions' }
    ],
    formFields: [
      { key: 'name', label: 'Trail Name', type: 'text' },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Green Circle', 'Blue Square', 'Black Diamond', 'Double Black Diamond', 'Terrain Park'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Closed', 'On Hold'] },
      { key: 'grooming_status', label: 'Grooming Status', type: 'select', options: ['Groomed', 'Ungroomed', 'Machine Groomed', 'Packed Powder'] },
      { key: 'length', label: 'Length (miles)', type: 'number' },
      { key: 'vertical_drop', label: 'Vertical Drop (ft)', type: 'number' },
      { key: 'snowfall_last24h', label: 'Snowfall Last 24h (in)', type: 'number' },
      { key: 'conditions', label: 'Conditions', type: 'textarea' },
      { key: 'last_groomed', label: 'Last Groomed', type: 'date' }
    ]
  },
  snowmaking: {
    title: 'Snowmaking',
    apiResource: 'snowmaking',
    icon: '❄️',
    description: 'Snowmaking operations and equipment management',
    searchField: 'trail_name',
    columns: [
      { key: 'trail_name', label: 'Trail' },
      { key: 'gun_type', label: 'Gun Type' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'water_usage', label: 'Water Usage' },
      { key: 'temperature', label: 'Temperature' },
      { key: 'humidity', label: 'Humidity' }
    ],
    formFields: [
      { key: 'trail_name', label: 'Trail Name', type: 'text' },
      { key: 'gun_type', label: 'Gun Type', type: 'select', options: ['Fan Gun', 'Tower Gun', 'Lance', 'Portable'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Standby', 'Off', 'Maintenance'] },
      { key: 'water_usage', label: 'Water Usage (gal/min)', type: 'number' },
      { key: 'energy_usage', label: 'Energy Usage (kWh)', type: 'number' },
      { key: 'temperature', label: 'Temperature (F)', type: 'number' },
      { key: 'humidity', label: 'Humidity (%)', type: 'number' },
      { key: 'start_time', label: 'Start Time', type: 'text' },
      { key: 'end_time', label: 'End Time', type: 'text' }
    ]
  },
  patrolIncidents: {
    title: 'Ski Patrol',
    apiResource: 'patrol-incidents',
    icon: '🚑',
    description: 'Patrol incidents, injuries, and safety reports',
    searchField: 'guest_name',
    columns: [
      { key: 'incident_type', label: 'Type' },
      { key: 'location', label: 'Location' },
      { key: 'severity', label: 'Severity', type: 'status' },
      { key: 'guest_name', label: 'Guest' },
      { key: 'patroller_name', label: 'Patroller' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    formFields: [
      { key: 'incident_type', label: 'Incident Type', type: 'select', options: ['Injury', 'Lost Person', 'Equipment Failure', 'Boundary Violation', 'Medical'] },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'severity', label: 'Severity', type: 'select', options: ['Minor', 'Moderate', 'Serious', 'Critical'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'patroller_name', label: 'Patroller Name', type: 'text' },
      { key: 'guest_name', label: 'Guest Name', type: 'text' },
      { key: 'guest_age', label: 'Guest Age', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Resolved', 'Closed'] },
      { key: 'reported_at', label: 'Reported At', type: 'text' },
      { key: 'resolved_at', label: 'Resolved At', type: 'text' }
    ]
  },
  rentalInventory: {
    title: 'Rental Shop',
    apiResource: 'rental-inventory',
    icon: '🎿',
    description: 'Rental equipment inventory and management',
    searchField: 'brand',
    columns: [
      { key: 'item_type', label: 'Item Type' },
      { key: 'brand', label: 'Brand' },
      { key: 'model', label: 'Model' },
      { key: 'size', label: 'Size' },
      { key: 'condition', label: 'Condition', type: 'status' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'daily_rate', label: 'Daily Rate', type: 'currency' }
    ],
    formFields: [
      { key: 'item_type', label: 'Item Type', type: 'select', options: ['Skis', 'Snowboard', 'Boots', 'Helmet', 'Poles', 'Goggles'] },
      { key: 'brand', label: 'Brand', type: 'text' },
      { key: 'model', label: 'Model', type: 'text' },
      { key: 'size', label: 'Size', type: 'text' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['New', 'Good', 'Fair', 'Needs Service'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Available', 'Rented', 'Maintenance'] },
      { key: 'daily_rate', label: 'Daily Rate', type: 'number' },
      { key: 'last_serviced', label: 'Last Serviced', type: 'date' }
    ]
  },
  lessons: {
    title: 'Ski School',
    apiResource: 'lessons',
    icon: '🏫',
    description: 'Ski and snowboard lesson scheduling',
    searchField: 'guest_name',
    columns: [
      { key: 'lesson_type', label: 'Type' },
      { key: 'skill_level', label: 'Skill Level' },
      { key: 'instructor_name', label: 'Instructor' },
      { key: 'guest_name', label: 'Guest' },
      { key: 'scheduled_date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    formFields: [
      { key: 'lesson_type', label: 'Lesson Type', type: 'select', options: ['Group', 'Private', 'Semi-Private'] },
      { key: 'skill_level', label: 'Skill Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { key: 'instructor_name', label: 'Instructor Name', type: 'text' },
      { key: 'guest_name', label: 'Guest Name', type: 'text' },
      { key: 'guest_count', label: 'Guest Count', type: 'number' },
      { key: 'scheduled_date', label: 'Scheduled Date', type: 'date' },
      { key: 'start_time', label: 'Start Time', type: 'text' },
      { key: 'duration', label: 'Duration (hours)', type: 'number' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'] },
      { key: 'meeting_point', label: 'Meeting Point', type: 'text' }
    ]
  },
  instructors: {
    title: 'Instructors',
    apiResource: 'instructors',
    icon: '👨‍🏫',
    description: 'Instructor profiles and availability',
    searchField: 'name',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'specialization', label: 'Specialization' },
      { key: 'certification_level', label: 'Certification' },
      { key: 'availability', label: 'Availability', type: 'status' },
      { key: 'rating', label: 'Rating' },
      { key: 'hourly_rate', label: 'Hourly Rate', type: 'currency' }
    ],
    formFields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'specialization', label: 'Specialization', type: 'select', options: ['Alpine', 'Snowboard', 'Cross-Country', 'Freestyle', 'Children'] },
      { key: 'certification_level', label: 'Certification Level', type: 'select', options: ['Level 1', 'Level 2', 'Level 3', 'Examiner'] },
      { key: 'languages', label: 'Languages', type: 'text' },
      { key: 'availability', label: 'Availability', type: 'select', options: ['Available', 'Busy', 'Off', 'On Leave'] },
      { key: 'hourly_rate', label: 'Hourly Rate', type: 'number' },
      { key: 'rating', label: 'Rating', type: 'number' },
      { key: 'years_experience', label: 'Years Experience', type: 'number' },
      { key: 'phone', label: 'Phone', type: 'text' }
    ]
  },
  snowReports: {
    title: 'Snow Reports',
    apiResource: 'snow-reports',
    icon: '🌨️',
    description: 'Daily snow and weather condition reports',
    searchField: 'conditions',
    columns: [
      { key: 'report_date', label: 'Date', type: 'date' },
      { key: 'new_snow', label: 'New Snow (in)' },
      { key: 'base_depth', label: 'Base Depth (in)' },
      { key: 'conditions', label: 'Conditions', type: 'status' },
      { key: 'trails_open', label: 'Trails Open' },
      { key: 'lifts_open', label: 'Lifts Open' }
    ],
    formFields: [
      { key: 'report_date', label: 'Report Date', type: 'date' },
      { key: 'new_snow', label: 'New Snow (inches)', type: 'number' },
      { key: 'base_depth', label: 'Base Depth (inches)', type: 'number' },
      { key: 'conditions', label: 'Conditions', type: 'select', options: ['Powder', 'Packed Powder', 'Groomed', 'Hard Pack', 'Ice', 'Spring', 'Corn'] },
      { key: 'temperature_high', label: 'High Temp (F)', type: 'number' },
      { key: 'temperature_low', label: 'Low Temp (F)', type: 'number' },
      { key: 'wind_speed', label: 'Wind Speed (mph)', type: 'number' },
      { key: 'wind_direction', label: 'Wind Direction', type: 'text' },
      { key: 'visibility', label: 'Visibility', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor', 'Whiteout'] },
      { key: 'trails_open', label: 'Trails Open', type: 'number' },
      { key: 'lifts_open', label: 'Lifts Open', type: 'number' },
      { key: 'published', label: 'Published', type: 'select', options: ['true', 'false'] }
    ]
  },
  parking: {
    title: 'Parking',
    apiResource: 'parking',
    icon: '🅿️',
    description: 'Parking lot capacity and management',
    searchField: 'lot_name',
    columns: [
      { key: 'lot_name', label: 'Lot Name' },
      { key: 'total_spaces', label: 'Total Spaces' },
      { key: 'occupied_spaces', label: 'Occupied' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'lot_type', label: 'Type' },
      { key: 'rate', label: 'Rate', type: 'currency' }
    ],
    formFields: [
      { key: 'lot_name', label: 'Lot Name', type: 'text' },
      { key: 'total_spaces', label: 'Total Spaces', type: 'number' },
      { key: 'occupied_spaces', label: 'Occupied Spaces', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Full', 'Closed'] },
      { key: 'lot_type', label: 'Lot Type', type: 'select', options: ['Standard', 'Premium', 'Accessible', 'Overflow', 'RV'] },
      { key: 'rate', label: 'Rate', type: 'number' },
      { key: 'distance_to_lodge', label: 'Distance to Lodge (ft)', type: 'number' },
      { key: 'shuttle_available', label: 'Shuttle Available', type: 'select', options: ['true', 'false'] }
    ]
  },
  foodBeverage: {
    title: 'Food & Beverage',
    apiResource: 'food-beverage',
    icon: '🍽️',
    description: 'Restaurant and dining operations',
    searchField: 'outlet_name',
    columns: [
      { key: 'outlet_name', label: 'Outlet' },
      { key: 'location', label: 'Location' },
      { key: 'cuisine_type', label: 'Cuisine' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'current_occupancy', label: 'Occupancy' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    formFields: [
      { key: 'outlet_name', label: 'Outlet Name', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'cuisine_type', label: 'Cuisine Type', type: 'text' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'current_occupancy', label: 'Current Occupancy', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Closed', 'Limited Menu'] },
      { key: 'opening_time', label: 'Opening Time', type: 'text' },
      { key: 'closing_time', label: 'Closing Time', type: 'text' },
      { key: 'avg_price', label: 'Average Price', type: 'number' },
      { key: 'menu_highlights', label: 'Menu Highlights', type: 'textarea' }
    ]
  },
  retail: {
    title: 'Retail',
    apiResource: 'retail',
    icon: '🛍️',
    description: 'Retail store sales and inventory',
    searchField: 'store_name',
    columns: [
      { key: 'store_name', label: 'Store' },
      { key: 'item_name', label: 'Item' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'Qty' },
      { key: 'unit_price', label: 'Unit Price', type: 'currency' },
      { key: 'transaction_date', label: 'Date', type: 'date' }
    ],
    formFields: [
      { key: 'store_name', label: 'Store Name', type: 'text' },
      { key: 'item_name', label: 'Item Name', type: 'text' },
      { key: 'category', label: 'Category', type: 'select', options: ['Apparel', 'Equipment', 'Accessories', 'Souvenirs'] },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'unit_price', label: 'Unit Price', type: 'number' },
      { key: 'total_price', label: 'Total Price', type: 'number' },
      { key: 'payment_method', label: 'Payment Method', type: 'text' },
      { key: 'customer_name', label: 'Customer Name', type: 'text' },
      { key: 'transaction_date', label: 'Transaction Date', type: 'date' }
    ]
  },
  childcare: {
    title: 'Childcare',
    apiResource: 'childcare',
    icon: '👶',
    description: 'Children\'s care and activity programs',
    searchField: 'child_name',
    columns: [
      { key: 'child_name', label: 'Child' },
      { key: 'parent_name', label: 'Parent' },
      { key: 'age', label: 'Age' },
      { key: 'check_in', label: 'Check In' },
      { key: 'meal_plan', label: 'Meal Plan' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    formFields: [
      { key: 'child_name', label: 'Child Name', type: 'text' },
      { key: 'parent_name', label: 'Parent Name', type: 'text' },
      { key: 'parent_phone', label: 'Parent Phone', type: 'text' },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'check_in', label: 'Check In', type: 'text' },
      { key: 'check_out', label: 'Check Out', type: 'text' },
      { key: 'special_needs', label: 'Special Needs', type: 'textarea' },
      { key: 'meal_plan', label: 'Meal Plan', type: 'select', options: ['None', 'Lunch', 'Full Day'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Checked In', 'Checked Out', 'Reserved'] },
      { key: 'rate', label: 'Rate', type: 'number' }
    ]
  },
  lostFound: {
    title: 'Lost & Found',
    apiResource: 'lost-found',
    icon: '🔍',
    description: 'Track lost and found items',
    searchField: 'item_description',
    columns: [
      { key: 'item_description', label: 'Item' },
      { key: 'category', label: 'Category' },
      { key: 'location_found', label: 'Found At' },
      { key: 'found_date', label: 'Found Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'storage_location', label: 'Storage' }
    ],
    formFields: [
      { key: 'item_description', label: 'Item Description', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'select', options: ['Clothing', 'Electronics', 'Accessories', 'Equipment', 'Other'] },
      { key: 'location_found', label: 'Location Found', type: 'text' },
      { key: 'found_date', label: 'Found Date', type: 'date' },
      { key: 'finder_name', label: 'Finder Name', type: 'text' },
      { key: 'claimed_by', label: 'Claimed By', type: 'text' },
      { key: 'claimed_date', label: 'Claimed Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Found', 'Claimed', 'Donated', 'Disposed'] },
      { key: 'storage_location', label: 'Storage Location', type: 'text' }
    ]
  },
  guestServices: {
    title: 'Guest Services',
    apiResource: 'guest-services',
    icon: '🛎️',
    description: 'Guest requests and service management',
    searchField: 'guest_name',
    columns: [
      { key: 'guest_name', label: 'Guest' },
      { key: 'request_type', label: 'Request Type' },
      { key: 'priority', label: 'Priority', type: 'status' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'assigned_to', label: 'Assigned To' },
      { key: 'location', label: 'Location' }
    ],
    formFields: [
      { key: 'guest_name', label: 'Guest Name', type: 'text' },
      { key: 'request_type', label: 'Request Type', type: 'select', options: ['Information', 'Complaint', 'Special Request', 'Accessibility', 'VIP'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Resolved', 'Closed'] },
      { key: 'assigned_to', label: 'Assigned To', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'resolved_at', label: 'Resolved At', type: 'text' }
    ]
  },
  events: {
    title: 'Events',
    apiResource: 'events',
    icon: '🎉',
    description: 'Resort events and activities calendar',
    searchField: 'event_name',
    columns: [
      { key: 'event_name', label: 'Event' },
      { key: 'event_type', label: 'Type' },
      { key: 'location', label: 'Location' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'registered', label: 'Registered' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    formFields: [
      { key: 'event_name', label: 'Event Name', type: 'text' },
      { key: 'event_type', label: 'Event Type', type: 'select', options: ['Race', 'Festival', 'Concert', 'Demo', 'Fundraiser'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'registered', label: 'Registered', type: 'number' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'Active', 'Completed', 'Cancelled'] },
      { key: 'organizer', label: 'Organizer', type: 'text' }
    ]
  },
  accommodations: {
    title: 'Accommodations',
    apiResource: 'accommodations',
    icon: '🏨',
    description: 'Lodging and accommodation bookings',
    searchField: 'property_name',
    columns: [
      { key: 'property_name', label: 'Property' },
      { key: 'room_type', label: 'Room Type' },
      { key: 'price_per_night', label: 'Price/Night', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'guest_name', label: 'Guest' },
      { key: 'booking_status', label: 'Booking', type: 'status' }
    ],
    formFields: [
      { key: 'property_name', label: 'Property Name', type: 'text' },
      { key: 'room_type', label: 'Room Type', type: 'select', options: ['Standard', 'Deluxe', 'Suite', 'Cabin', 'Condo'] },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'price_per_night', label: 'Price Per Night', type: 'number' },
      { key: 'amenities', label: 'Amenities', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['Available', 'Occupied', 'Maintenance', 'Reserved'] },
      { key: 'guest_name', label: 'Guest Name', type: 'text' },
      { key: 'check_in', label: 'Check In', type: 'date' },
      { key: 'check_out', label: 'Check Out', type: 'date' },
      { key: 'booking_status', label: 'Booking Status', type: 'select', options: ['Confirmed', 'Pending', 'Checked In', 'Checked Out', 'Cancelled'] }
    ]
  },
  shuttles: {
    title: 'Shuttles',
    apiResource: 'shuttles',
    icon: '🚐',
    description: 'Shuttle routes and transportation',
    searchField: 'route_name',
    columns: [
      { key: 'route_name', label: 'Route' },
      { key: 'vehicle_id', label: 'Vehicle' },
      { key: 'driver_name', label: 'Driver' },
      { key: 'current_passengers', label: 'Passengers' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'frequency_minutes', label: 'Frequency (min)' }
    ],
    formFields: [
      { key: 'route_name', label: 'Route Name', type: 'text' },
      { key: 'vehicle_id', label: 'Vehicle ID', type: 'text' },
      { key: 'driver_name', label: 'Driver Name', type: 'text' },
      { key: 'capacity', label: 'Capacity', type: 'number' },
      { key: 'current_passengers', label: 'Current Passengers', type: 'number' },
      { key: 'departure_time', label: 'Departure Time', type: 'text' },
      { key: 'arrival_time', label: 'Arrival Time', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Running', 'Delayed', 'Out of Service', 'Scheduled'] },
      { key: 'frequency_minutes', label: 'Frequency (minutes)', type: 'number' },
      { key: 'stops', label: 'Stops', type: 'textarea' }
    ]
  },
  equipmentMaintenance: {
    title: 'Equipment Maintenance',
    apiResource: 'equipment-maintenance',
    icon: '🔧',
    description: 'Equipment maintenance scheduling and tracking',
    searchField: 'equipment_name',
    columns: [
      { key: 'equipment_name', label: 'Equipment' },
      { key: 'equipment_type', label: 'Type' },
      { key: 'maintenance_type', label: 'Maintenance' },
      { key: 'technician', label: 'Technician' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'priority', label: 'Priority', type: 'status' }
    ],
    formFields: [
      { key: 'equipment_name', label: 'Equipment Name', type: 'text' },
      { key: 'equipment_type', label: 'Equipment Type', type: 'select', options: ['Chair Lift', 'Gondola', 'Groomer', 'Snowmobile', 'Snow Gun'] },
      { key: 'maintenance_type', label: 'Maintenance Type', type: 'select', options: ['Preventive', 'Corrective', 'Emergency', 'Inspection'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'technician', label: 'Technician', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In Progress', 'Completed', 'Overdue'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
      { key: 'scheduled_date', label: 'Scheduled Date', type: 'date' },
      { key: 'completed_date', label: 'Completed Date', type: 'date' },
      { key: 'cost', label: 'Cost', type: 'number' }
    ]
  },
  rfidAccess: {
    title: 'RFID Access',
    apiResource: 'rfid-access',
    icon: '📡',
    description: 'RFID card access monitoring and logs',
    searchField: 'holder_name',
    columns: [
      { key: 'card_id', label: 'Card ID' },
      { key: 'holder_name', label: 'Holder' },
      { key: 'access_point', label: 'Access Point' },
      { key: 'access_type', label: 'Access Type' },
      { key: 'pass_type', label: 'Pass Type' },
      { key: 'timestamp', label: 'Time' }
    ],
    formFields: [
      { key: 'card_id', label: 'Card ID', type: 'text' },
      { key: 'holder_name', label: 'Holder Name', type: 'text' },
      { key: 'access_point', label: 'Access Point', type: 'text' },
      { key: 'access_type', label: 'Access Type', type: 'select', options: ['Entry', 'Exit', 'Lift', 'Restricted'] },
      { key: 'timestamp', label: 'Timestamp', type: 'text' },
      { key: 'pass_type', label: 'Pass Type', type: 'select', options: ['Day', 'Season', 'VIP', 'Employee'] },
      { key: 'valid', label: 'Valid', type: 'select', options: ['true', 'false'] }
    ]
  },
  weatherStations: {
    title: 'Weather Stations',
    apiResource: 'weather-stations',
    icon: '🌡️',
    description: 'Real-time weather station data',
    searchField: 'station_name',
    columns: [
      { key: 'station_name', label: 'Station' },
      { key: 'location', label: 'Location' },
      { key: 'elevation', label: 'Elevation' },
      { key: 'temperature', label: 'Temp' },
      { key: 'wind_speed', label: 'Wind' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    formFields: [
      { key: 'station_name', label: 'Station Name', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'elevation', label: 'Elevation (ft)', type: 'number' },
      { key: 'temperature', label: 'Temperature (F)', type: 'number' },
      { key: 'humidity', label: 'Humidity (%)', type: 'number' },
      { key: 'wind_speed', label: 'Wind Speed (mph)', type: 'number' },
      { key: 'wind_direction', label: 'Wind Direction', type: 'text' },
      { key: 'barometric_pressure', label: 'Barometric Pressure', type: 'number' },
      { key: 'snow_depth', label: 'Snow Depth (in)', type: 'number' },
      { key: 'visibility', label: 'Visibility', type: 'text' },
      { key: 'last_updated', label: 'Last Updated', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Online', 'Offline', 'Maintenance'] }
    ]
  },
  avalancheControl: {
    title: 'Avalanche Control',
    apiResource: 'avalanche-control',
    icon: '🏔️',
    description: 'Avalanche risk assessment and control operations',
    searchField: 'zone_name',
    columns: [
      { key: 'zone_name', label: 'Zone' },
      { key: 'risk_level', label: 'Risk Level', type: 'status' },
      { key: 'control_method', label: 'Method' },
      { key: 'team_lead', label: 'Team Lead' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'result', label: 'Result' }
    ],
    formFields: [
      { key: 'zone_name', label: 'Zone Name', type: 'text' },
      { key: 'risk_level', label: 'Risk Level', type: 'select', options: ['Low', 'Moderate', 'Considerable', 'High', 'Extreme'] },
      { key: 'control_method', label: 'Control Method', type: 'select', options: ['Explosive', 'Ski Cut', 'Artillery', 'Helicopter'] },
      { key: 'team_lead', label: 'Team Lead', type: 'text' },
      { key: 'team_size', label: 'Team Size', type: 'number' },
      { key: 'start_time', label: 'Start Time', type: 'text' },
      { key: 'end_time', label: 'End Time', type: 'text' },
      { key: 'result', label: 'Result', type: 'textarea' },
      { key: 'weather_conditions', label: 'Weather Conditions', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'In Progress', 'Completed', 'Cancelled'] }
    ]
  },
  staffing: {
    title: 'Staffing',
    apiResource: 'staffing',
    icon: '👥',
    description: 'Staff scheduling and shift management',
    searchField: 'employee_name',
    columns: [
      { key: 'employee_name', label: 'Employee' },
      { key: 'department', label: 'Department' },
      { key: 'position', label: 'Position' },
      { key: 'shift_date', label: 'Shift Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'hours_worked', label: 'Hours' }
    ],
    formFields: [
      { key: 'employee_name', label: 'Employee Name', type: 'text' },
      { key: 'department', label: 'Department', type: 'select', options: ['Lifts', 'Patrol', 'Ski School', 'Food Service', 'Retail', 'Maintenance', 'Guest Services', 'Admin'] },
      { key: 'position', label: 'Position', type: 'text' },
      { key: 'shift_date', label: 'Shift Date', type: 'date' },
      { key: 'shift_start', label: 'Shift Start', type: 'text' },
      { key: 'shift_end', label: 'Shift End', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Active', 'Completed', 'Absent', 'On Break'] },
      { key: 'hourly_rate', label: 'Hourly Rate', type: 'number' },
      { key: 'hours_worked', label: 'Hours Worked', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  terrainPark: {
    title: 'Terrain Park',
    apiResource: 'terrain-park',
    icon: '🏂',
    description: 'Terrain park features and inspections',
    searchField: 'feature_name',
    columns: [
      { key: 'feature_name', label: 'Feature' },
      { key: 'feature_type', label: 'Type' },
      { key: 'size', label: 'Size' },
      { key: 'difficulty', label: 'Difficulty', type: 'status' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'condition', label: 'Condition', type: 'status' }
    ],
    formFields: [
      { key: 'feature_name', label: 'Feature Name', type: 'text' },
      { key: 'feature_type', label: 'Feature Type', type: 'select', options: ['Jump', 'Rail', 'Box', 'Halfpipe', 'Quarterpipe', 'Wall Ride'] },
      { key: 'size', label: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'XL'] },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Closed', 'Under Construction', 'Maintenance'] },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'last_inspected', label: 'Last Inspected', type: 'date' },
      { key: 'inspector', label: 'Inspector', type: 'text' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] }
    ]
  }
};
