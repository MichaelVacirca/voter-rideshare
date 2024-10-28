// Dashboard.js - Main UI for ride sharing (React)
import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRides = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get('/api/rides/search', {
        params: { pickupLocation, destination, time },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRides(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert('Failed to search for rides');
    }
  };

  const handleMatchRide = async (rideId) => {
    try {
      const response = await axios.put(`/api/rides/match/${rideId}`, {
        matchedRideId: rideId,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('Ride successfully matched!');
      setRides(rides.filter((ride) => ride._id !== rideId));
    } catch (err) {
      alert('Failed to match the ride');
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-container">
        <h2>Find a Ride</h2>
        <form onSubmit={searchRides} className="search-form">
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
            {loading ? 'Searching...' : 'Search Rides'}
          </button>
        </form>

        <div className="ride-results">
          <h3>Available Rides:</h3>
          {rides.length > 0 ? (
            <ul>
              {rides.map((ride) => (
                <li key={ride._id} className="ride-item">
                  <div>
                    <strong>From:</strong> {ride.pickupLocation} <br />
                    <strong>To:</strong> {ride.destination} <br />
                    <strong>Time:</strong> {new Date(ride.time).toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleMatchRide(ride._id)}
                    className="btn match-btn"
                  >
                    Match Ride
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No rides available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;