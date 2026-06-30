import React from 'react';
import AvailabilityDashboard from './components/AvailabilityDashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>👥 Team Availability Tracker</h1>
        <p>Manage team member availability status in real-time</p>
      </header>
      <main className="app-main">
        <AvailabilityDashboard />
      </main>
    </div>
  );
}

export default App;
