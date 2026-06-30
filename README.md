# Team Availability Tracker

A modern, real-time team availability tracking dashboard that allows team members to toggle their availability status. Built with Node.js/Express backend and React frontend, with SQLite database for persistence.

## Features

✨ **Core Features:**
- **Real-time Availability Toggle** - Instant updates when toggling availability status
- **Live Statistics** - View total, available, and unavailable team members at a glance
- **Filter & Search** - Filter team members by availability status
- **Persistent State** - All changes are saved to the database
- **Availability History** - Track when each team member's status was last updated
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Beautiful UI** - Modern gradient design with smooth animations

## Tech Stack

**Backend:**
- Node.js with Express.js
- SQLite3 for data persistence
- CORS enabled for frontend communication
- RESTful API architecture

**Frontend:**
- React 18
- Axios for API calls
- CSS3 with responsive design
- Modern component architecture

## Project Structure

```
team-tracker/
├── server.js                    # Express server & API endpoints
├── package.json                 # Backend dependencies
├── scripts/
│   └── init-db.js              # Database initialization script
├── data/                        # SQLite database (created at runtime)
├── client/                      # React frontend
│   ├── package.json            # Frontend dependencies
│   ├── public/
│   │   └── index.html          # Main HTML file
│   └── src/
│       ├── index.js            # React entry point
│       ├── App.js              # Root component
│       ├── App.css             # App styles
│       ├── index.css           # Global styles
│       └── components/
│           ├── AvailabilityDashboard.js      # Main dashboard component
│           ├── AvailabilityDashboard.css     # Dashboard styles
│           ├── UserCard.js                   # Individual user card
│           └── UserCard.css                  # Card styles
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gattulokesh68-netizen/team-tracker.git
   cd team-tracker
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run db:init
   ```
   This creates `data/team-tracker.db` and seeds it with 5 sample users.

4. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Adjust values in `.env` if needed (default port: 5000)

### Running the Application

**Terminal 1 - Start Backend Server:**
```bash
npm start
```
Server runs on `http://localhost:5000`

**Terminal 2 - Start Frontend Development Server:**
```bash
cd client
npm start
```
Frontend runs on `http://localhost:3000`

The app will open automatically at `http://localhost:3000`

## API Endpoints

### Get All Users
```
GET /api/users
```
**Response:**
```json
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "avatar": "👩‍💼",
    "isAvailable": true,
    "lastUpdated": "2026-06-30T18:55:40Z",
    "createdAt": "2026-06-30T18:55:40Z"
  }
]
```

### Get Single User
```
GET /api/users/:id
```

### Update Availability Status
```
PUT /api/users/:id/availability
```
**Request Body:**
```json
{
  "isAvailable": true
}
```
**Response:** Updated user object

### Get Availability History
```
GET /api/users/:id/history
```
**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "isAvailable": true,
    "changedAt": "2026-06-30T18:55:40Z"
  }
]
```

### Create New User
```
POST /api/users
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "👨‍💼"
}
```

### Health Check
```
GET /api/health
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT,
  isAvailable BOOLEAN DEFAULT 1,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Availability History Table
```sql
CREATE TABLE availability_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  isAvailable BOOLEAN NOT NULL,
  changedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
)
```

## Frontend Components

### AvailabilityDashboard
Main dashboard component that:
- Fetches users from the API
- Manages filter state (all/available/unavailable)
- Displays statistics cards
- Renders user cards in a responsive grid
- Handles loading and error states

**State Management:**
- `users` - Array of user objects
- `loading` - Loading indicator
- `error` - Error message display
- `filter` - Current filter selection
- `updatingUserId` - Track which user is being updated

### UserCard
Individual user card component featuring:
- User avatar and status indicator
- Availability badge with visual indicator
- Toggle switch for changing availability
- Last updated timestamp
- Responsive design

**Props:**
- `user` - User object
- `onToggle` - Callback function for toggle changes
- `isUpdating` - Loading state during API call

## Key Features & Implementation

### State Synchronization
- Frontend state is immediately updated upon successful API response
- Toggle switches show loading state during API requests
- Error messages appear if updates fail
- Retry functionality available for failed requests

### Conditional Rendering
- **Loading State** - Spinner displayed while fetching users
- **Empty State** - Message when no users match filter
- **Error State** - Error alert with retry button
- **Data State** - Grid of user cards when data loads
- **Filter State** - Different users shown based on availability filter

### Visual Feedback
- **Status Indicators** - Pulsing green (available) or red (unavailable) dots
- **Status Badges** - Color-coded availability badges
- **Toggle Animation** - Smooth sliding toggle switch
- **Hover Effects** - Cards lift on hover with shadow changes
- **Loading Animation** - Spinning loader during data fetch

## Usage Examples

### Toggle User Availability
1. Click the toggle switch on any user card
2. The switch shows "Updating..." state
3. API request is sent to update database
4. Card updates with new status
5. Status indicator and badge change color
6. Last updated timestamp refreshes

### Filter Users
1. Click "Available", "Unavailable", or "All" button
2. Grid filters to show only matching users
3. Statistics update to reflect filtered count
4. Clicking filter again resets to that view

### View Statistics
- **Total Team Members** - Count of all users
- **Available** - Count of users marked as available
- **Unavailable** - Count of users marked as unavailable

## Development

### Add New User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "avatar": "👩‍💻"
  }'
```

### Toggle Availability
```bash
curl -X PUT http://localhost:5000/api/users/1/availability \
  -H "Content-Type: application/json" \
  -d '{
    "isAvailable": false
  }'
```

### View User History
```bash
curl http://localhost:5000/api/users/1/history
```

## Production Build

**Build frontend:**
```bash
cd client
npm run build
cd ..
```

This creates an optimized production build in `client/build/`

## Performance Considerations

- **Database Indexing** - User queries are optimized with database indexes
- **Lazy Loading** - Components load data on mount
- **Memoization** - Consider adding React.memo for UserCard components in large lists
- **Debouncing** - Could add debounce to filter changes for very large datasets

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Database Connection Error
```
Error opening database: Error: SQLITE_CANTOPEN
```
**Solution:** Ensure the `data/` directory exists and has proper permissions.

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change PORT in `.env` or kill the process using port 5000.

### CORS Errors
**Solution:** Verify the proxy is set in `client/package.json`:
```json
"proxy": "http://localhost:5000"
```

### Cannot find module
**Solution:** Ensure all dependencies are installed:
```bash
npm install
cd client && npm install && cd ..
```

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time updates with WebSockets
- [ ] Availability notes/status messages
- [ ] Time-based automatic status changes
- [ ] Slack/Teams integration
- [ ] Admin dashboard for user management
- [ ] Export availability reports
- [ ] User preferences and settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
