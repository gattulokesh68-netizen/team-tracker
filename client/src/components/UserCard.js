import React from 'react';
import './UserCard.css';

const UserCard = ({ user, onToggle, isUpdating }) => {
  const handleToggle = () => {
    onToggle(user.id, user.isAvailable);
  };

  const lastUpdated = new Date(user.lastUpdated).toLocaleString();

  return (
    <div className={`user-card ${user.isAvailable ? 'available' : 'unavailable'}`}>
      {/* Card Header with Avatar and Status */}
      <div className="user-card-header">
        <div className="user-avatar">{user.avatar}</div>
        <div className="status-indicator" title={user.isAvailable ? 'Available' : 'Unavailable'}>
          <span className={`status-dot ${user.isAvailable ? 'online' : 'offline'}`}></span>
        </div>
      </div>

      {/* User Info */}
      <div className="user-info">
        <h3 className="user-name">{user.name}</h3>
        <p className="user-email">{user.email}</p>
      </div>

      {/* Status Badge */}
      <div className="status-badge-container">
        <span className={`status-badge ${user.isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
          {user.isAvailable ? '✓ Available' : '✗ Unavailable'}
        </span>
      </div>

      {/* Toggle Switch */}
      <div className="toggle-container">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={user.isAvailable}
            onChange={handleToggle}
            disabled={isUpdating}
            className="toggle-checkbox"
          />
          <span className={`toggle-switch ${isUpdating ? 'updating' : ''}`}>
            <span className="toggle-slider"></span>
          </span>
          <span className="toggle-text">
            {isUpdating ? 'Updating...' : (user.isAvailable ? 'Mark Unavailable' : 'Mark Available')}
          </span>
        </label>
      </div>

      {/* Last Updated Info */}
      <div className="user-meta">
        <small>Updated: {lastUpdated}</small>
      </div>
    </div>
  );
};

export default UserCard;
