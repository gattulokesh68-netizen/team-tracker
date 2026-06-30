# Architecture & Implementation Details

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React Application (port 3000)                   │  │
│  │  ├─ App Component (root)                        │  │
│  │  ├─ AvailabilityDashboard (main logic)          │  │
│  │  └─ UserCard (individual cards)                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────┘
                  │ HTTP/CORS
                  │
┌─────────────────▼──────────────────────────────────────┐
│              Node.js Backend Server                    │
│              (Express, port 5000)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Routes                                      │  │
│  │  ├─ GET /api/users                              │  │
│  │  ├─ PUT /api/users/:id/availability             │  │
│  │  ├─ GET /api/users/:id/history                  │  │
│  │  └─ POST /api/users                             │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Database Helper Functions                       │  │
│  │  ├─ dbAll() - SELECT queries                     │  │
│  │  └─ dbRun() - INSERT/UPDATE/DELETE queries      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────┘
                  │ File System
                  │
┌─────────────────▼──────────────────────────────────────┐
│           SQLite Database                              │
│           (data/team-tracker.db)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  users table                                     │  │
│  │  ├─ id (PRIMARY KEY)                            │  │
│  │  ├─ name                                         │  │
│  │  ├─ email                                        │  │
│  │  ├─ avatar                                       │  │
│  │  ├─ isAvailable (BOOLEAN)                       │  │
│  │  ├─ lastUpdated (TIMESTAMP)                     │  │
│  │  └─ createdAt (TIMESTAMP)                       │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  availability_history table                     │  │
│  │  ├─ id (PRIMARY KEY)                            │  │
│  │  ├─ userId (FOREIGN KEY)                        │  │
│  │  ├─ isAvailable (BOOLEAN)                       │  │
│  │  └─ changedAt (TIMESTAMP)                       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## Data Flow: Toggle Availability

### User Action
```
1. User clicks toggle switch on UserCard
   ↓
2. handleToggle() function triggered
   ↓
3. onToggle callback called with (userId, currentStatus)
```

### Frontend State Update
```
4. AvailabilityDashboard.handleToggleAvailability() executed
   ↓
5. setUpdatingUserId(userId) - disable the toggle
   ↓
6. axios.put() sends request to backend
   ↓
7. UI shows "Updating..." state
```

### Backend Processing
```
8. Express route PUT /api/users/:id/availability
   ↓
9. Validate isAvailable is boolean
   ↓
10. Execute SQL UPDATE query on users table
    UPDATE users SET isAvailable = ?, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?
    ↓
11. Execute SQL INSERT into availability_history table
    INSERT INTO availability_history (userId, isAvailable) VALUES (?, ?)
    ↓
12. Query updated user from database
    SELECT * FROM users WHERE id = ?
    ↓
13. Return updated user object as JSON response
```

### Frontend State Sync
```
14. Response received with updated user data
    ↓
15. setUpdatingUserId(null) - re-enable the toggle
    ↓
16. setUsers() - update local state with new user data
    ↓
17. Component re-renders with new isAvailable value
    ↓
18. Toggle switch changes visual state
    ↓
19. Status badge updates color and text
    ↓
20. lastUpdated timestamp refreshes
```

## Component Hierarchy

```
App
└── AvailabilityDashboard
    ├── StatisticsSection
    │   ├── StatCard (Total)
    │   ├── StatCard (Available)
    │   └── StatCard (Unavailable)
    ├── FilterSection
    │   ├── Button (All)
    │   ├── Button (Available)
    │   └── Button (Unavailable)
    ├── LoadingContainer (conditional)
    ├── EmptyState (conditional)
    ├── ErrorMessage (conditional)
    └── UsersGrid
        └── UserCard (repeated for each user)
            ├── Avatar
            ├── StatusIndicator
            ├── UserInfo
            ├── StatusBadge
            ├── ToggleSwitch
            └── UserMeta
```

## State Management

### AvailabilityDashboard State

```javascript
{
  users: [                    // All fetched users
    {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      avatar: "👩‍💼",
      isAvailable: true,      // Key state
      lastUpdated: "2026-06-30T18:55:40Z",
      createdAt: "2026-06-30T18:55:40Z"
    },
    // ... more users
  ],
  loading: false,            // API request in progress
  error: null,               // Error message if any
  filter: "all",             // Current filter: "all", "available", "unavailable"
  updatingUserId: null       // ID of user being toggled (for UI feedback)
}
```

### Derived State

```javascript
filteredUsers = users.filter(user => {
  if (filter === 'available') return user.isAvailable;
  if (filter === 'unavailable') return !user.isAvailable;
  return true; // 'all'
});

totalUsers = users.length;
availableCount = users.filter(u => u.isAvailable).length;
unavailableCount = totalUsers - availableCount;
```

## Conditional Rendering Logic

### Loading State
```javascript
{loading && (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Loading team members...</p>
  </div>
)}
```
Shown when: `loading === true` (on component mount)

### Error State
```javascript
{error && (
  <div className="error-message">
    <span>⚠️ {error}</span>
    <button onClick={fetchUsers}>Retry</button>
  </div>
)}
```
Shown when: `error !== null` (API call fails)

### Empty State
```javascript
{!loading && filteredUsers.length === 0 && (
  <div className="empty-state">
    <div className="empty-icon">🗑️</div>
    <p>No team members found</p>
  </div>
)}
```
Shown when: No filter results (filter applied but no matches)

### Data State
```javascript
{!loading && filteredUsers.length > 0 && (
  <div className="users-grid">
    {filteredUsers.map(user => (
      <UserCard key={user.id} user={user} ... />
    ))}
  </div>
)}
```
Shown when: Data loaded and filter has results

## API Response Structure

### Get Users Response
```json
200 OK
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "avatar": "👩‍💼",
    "isAvailable": 1,
    "lastUpdated": "2026-06-30T18:55:40Z",
    "createdAt": "2026-06-30T18:55:40Z"
  }
]
```

### Update Availability Response
```json
200 OK
{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "avatar": "👩‍💼",
  "isAvailable": 0,
  "lastUpdated": "2026-06-30T19:00:00Z",
  "createdAt": "2026-06-30T18:55:40Z"
}
```

### Error Response
```json
500 Internal Server Error
{
  "error": "Failed to update availability"
}
```

## CSS Animations

### Toggle Switch Animation
```css
.toggle-slider {
  transition: left 0.3s ease;
}

.toggle-checkbox:checked + .toggle-switch .toggle-slider {
  left: 24px;  /* Slides from left:2px to left:24px */
}
```

### Status Dot Pulse
```css
.status-dot {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Loading Spinner
```css
.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## Performance Optimizations

1. **Debounced Filter** - Filter changes update state directly
2. **Memoization** - UserCard could be wrapped with React.memo
3. **Key Prop** - Using user.id as key for list rendering
4. **Lazy State** - Only fetch data on component mount
5. **Error Boundaries** - Could add Error Boundary component

## Security Considerations

1. **Input Validation** - Server validates isAvailable is boolean
2. **SQL Injection** - Using parameterized queries
3. **CORS** - Enabled to allow frontend-backend communication
4. **Error Handling** - Server doesn't expose sensitive errors

## Database Queries

### Create User
```sql
INSERT INTO users (name, email, avatar, isAvailable)
VALUES (?, ?, ?, 1)
```

### Read Users
```sql
SELECT id, name, email, avatar, isAvailable, lastUpdated, createdAt
FROM users
ORDER BY name ASC
```

### Update Availability
```sql
UPDATE users
SET isAvailable = ?, lastUpdated = CURRENT_TIMESTAMP
WHERE id = ?
```

### Record History
```sql
INSERT INTO availability_history (userId, isAvailable)
VALUES (?, ?)
```

### Read History
```sql
SELECT id, userId, isAvailable, changedAt
FROM availability_history
WHERE userId = ?
ORDER BY changedAt DESC
LIMIT 20
```

## Error Handling Flow

```
API Call ← try/catch → Error caught
                          ↓
                  console.error()
                          ↓
                  setError(message)
                          ↓
                  Error banner shown
                          ↓
                  User clicks Retry
                          ↓
                  fetchUsers() called again
                          ↓
                  setError(null) - Clear error
                          ↓
                  Retry data fetch
```

## Testing Checklist

- [ ] Load dashboard - displays all users
- [ ] Click toggle - status updates immediately
- [ ] Filter by "Available" - shows only available users
- [ ] Filter by "Unavailable" - shows only unavailable users
- [ ] Filter by "All" - shows all users
- [ ] Statistics update correctly with filters
- [ ] Last updated timestamp changes on toggle
- [ ] Error handling on API failure
- [ ] Retry button works after error
- [ ] Responsive on mobile (< 768px)
- [ ] Toggle switch styling correct
- [ ] Status indicators animate (pulse)
