# Team Availability Tracker - Setup & Usage Guide

## Quick Start Guide

### Step 1: Database Setup

```bash
# Install dependencies
npm install

# Initialize database with sample data
npm run db:init
```

**What this does:**
- Creates SQLite database at `data/team-tracker.db`
- Creates `users` and `availability_history` tables
- Adds 5 sample team members with random availability status

### Step 2: Start Backend

```bash
npm start
```

✅ Server will run on `http://localhost:5000`

**Verify it's working:**
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Step 3: Start Frontend

In a **new terminal**:

```bash
cd client
npm install  # First time only
npm start
```

✅ App will open automatically at `http://localhost:3000`

## Dashboard Features Explained

### Statistics Cards

Three cards at the top show:
1. **Total Team Members** - All users in the system
2. **Available** - Users currently marked as available
3. **Unavailable** - Users currently marked as unavailable

### Filter Buttons

Three filter options:
- **All** - Show all team members
- **Available** - Show only available members
- **Unavailable** - Show only unavailable members

### User Cards

Each card displays:
- User avatar (emoji) with status indicator dot
- Name and email
- Availability badge (✓ or ✗)
- Toggle switch to change status
- Last updated timestamp

## How to Use

### Toggle Someone's Availability

1. Find the user card
2. Click the toggle switch
3. Watch the switch animate to new position
4. Status badge updates instantly
5. Last updated time refreshes

### Filter by Status

1. Click "Available" to see only available users
2. Click "Unavailable" to see only unavailable users
3. Click "All" to see everyone again
4. Statistics automatically update

### Check Last Update Time

Each card shows "Updated: [date/time]" at the bottom

## Database Operations

### View All Users

```bash
curl http://localhost:5000/api/users
```

Returns JSON array of all users.

### Get Single User

```bash
curl http://localhost:5000/api/users/1
```

### Update Availability

```bash
curl -X PUT http://localhost:5000/api/users/1/availability \
  -H "Content-Type: application/json" \
  -d '{"isAvailable": true}'
```

### View History

```bash
curl http://localhost:5000/api/users/1/history
```

Shows the last 20 status changes.

### Add New User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "you@example.com",
    "avatar": "👤"
  }'
```

## Code Structure

### Backend (server.js)

**Key Functions:**
- `GET /api/users` - Fetch all users
- `PUT /api/users/:id/availability` - Update availability
- `GET /api/users/:id/history` - Get change history
- `POST /api/users` - Create new user

**Database Helpers:**
- `dbAll()` - Execute SELECT query
- `dbRun()` - Execute INSERT/UPDATE/DELETE

### Frontend Components

**AvailabilityDashboard.js** (Main Component)
- Fetches users on mount
- Manages filter and loading states
- Handles availability toggles
- Calculates statistics

**UserCard.js** (Card Component)
- Displays individual user info
- Shows status indicator
- Provides toggle switch
- Shows last updated time

## State Flow Diagram

```
User clicks toggle
        ↓
handleToggleAvailability() called
        ↓
setUpdatingUserId(id) - disable toggle
        ↓
API PUT request sent
        ↓
Server updates database + records history
        ↓
Response returned with updated user
        ↓
Local state updated with response
        ↓
Component re-renders
        ↓
UI shows new status, last updated time refreshes
```

## Key Technologies

### Backend
- **Express** - Web framework
- **SQLite3** - Database
- **Axios** (Frontend) - HTTP client

### Frontend
- **React 18** - UI library
- **Axios** - API calls
- **CSS3** - Styling with animations

## Environment Variables

Create `.env` file:

```env
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data/team-tracker.db
```

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Change PORT in .env or `lsof -ti:5000 \| xargs kill -9` |
| Database file not found | Run `npm run db:init` |
| Cannot connect from frontend | Ensure proxy in client/package.json is set |
| Toggle not working | Check browser console for errors, restart backend |

## Testing the API

Use curl or Postman to test endpoints:

```bash
# Get all users
curl http://localhost:5000/api/users

# Update user 1 to unavailable
curl -X PUT http://localhost:5000/api/users/1/availability \
  -H "Content-Type: application/json" \
  -d '{"isAvailable": false}'

# Create new user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "avatar": "🧪"
  }'
```

## Next Steps

1. Explore the dashboard UI
2. Try toggling different users
3. Use filters to view subsets
4. Check the browser console (F12) to see API calls
5. Review the code in `server.js` and `client/src/components/`

## Need Help?

- Check the main README.md for more details
- Review error messages in browser console (F12)
- Check terminal output for backend errors
- Verify database exists at `data/team-tracker.db`
