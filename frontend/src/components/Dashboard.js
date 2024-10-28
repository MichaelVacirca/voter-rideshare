import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const [action, setAction] = useState(''); // 'offer' or 'request'
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRegisterRide = async (e) => {
    e.preventDefault();
    if (!action) {
      alert('Please select either needing a ride or offering a ride.');
      return;
    }

    try {
      const response = await axios.post('/api/rides/register', {
        rideType: action,
        pickupLocation,
        destination,
        time,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert(`Ride ${action} registered successfully!`);
    } catch (err) {
      alert('Failed to register ride');
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-container">
        <h2>Register for a Ride</h2>
        <div className="ride-options">
          <button onClick={() => setAction('offer')} className={`btn ${action === 'offer' ? 'selected' : ''}`}>
            Offer a Ride
          </button>
          <button onClick={() => setAction('request')} className={`btn ${action === 'request' ? 'selected' : ''}`}>
            Need a Ride
          </button>
        </div>
        <form onSubmit={handleRegisterRide} className="ride-form">
          <input
            type="text"
            placeholder="Pickup Location"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="form-input"
          />
          <button type="submit" className="btn primary">
            Register {action === 'offer' ? 'as an Offer' : 'as a Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
