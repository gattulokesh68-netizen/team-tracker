import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserCard from './UserCard';
import './AvailabilityDashboard.css';

const AvailabilityDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'unavailable'
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle availability toggle
  const handleToggleAvailability = async (userId, currentStatus) => {
    try {
      setUpdatingUserId(userId);
      const newStatus = !currentStatus;

      const response = await axios.put(
        `/api/users/${userId}/availability`,
        { isAvailable: newStatus }
      );

      // Update local state with the response
      setUsers(users.map(user =>
        user.id === userId ? { ...user, isAvailable: response.data.isAvailable, lastUpdated: response.data.lastUpdated } : user
      ));
    } catch (err) {
      console.error('Error updating availability:', err);
      setError('Failed to update availability. Please try again.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filter users based on availability status
  const filteredUsers = users.filter(user => {
    if (filter === 'available') return user.isAvailable;
    if (filter === 'unavailable') return !user.isAvailable;
    return true;
  });

  // Calculate statistics
  const totalUsers = users.length;
  const availableCount = users.filter(u => u.isAvailable).length;
  const unavailableCount = totalUsers - availableCount;

  return (
    <div className="dashboard-container">
      {/* Statistics Section */}
      <div className="statistics-section">
        <div className="stat-card">
          <div className="stat-value">{totalUsers}</div>
          <div className="stat-label">Total Team Members</div>
        </div>
        <div className="stat-card available">
          <div className="stat-value">{availableCount}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card unavailable">
          <div className="stat-value">{unavailableCount}</div>
          <div className="stat-label">Unavailable</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({totalUsers})
        </button>
        <button
          className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
          onClick={() => setFilter('available')}
        >
          Available ({availableCount})
        </button>
        <button
          className={`filter-btn ${filter === 'unavailable' ? 'active' : ''}`}
          onClick={() => setFilter('unavailable')}
        >
          Unavailable ({unavailableCount})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={fetchUsers} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading team members...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🗑️</div>
          <p>No team members found</p>
        </div>
      )}

      {/* Users Grid */}
      {!loading && filteredUsers.length > 0 && (
        <div className="users-grid">
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onToggle={handleToggleAvailability}
              isUpdating={updatingUserId === user.id}
            />
          ))}
        </div>
      )}

      {/* Last Updated */}
      {!loading && users.length > 0 && (
        <div className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default AvailabilityDashboard;
