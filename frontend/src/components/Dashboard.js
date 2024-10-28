// Dashboard.js - Main UI for ride sharing (React)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('');
  const [rides, setRides] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to search for rides
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

  // Function to load available ride requests for matching
  const loadAvailableRequests = async () => {
    try {
      const response = await axios.get('/api/rides/search', {
        params: { rideType: 'request' },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAvailableRequests(response.data);
    } catch (err) {
      alert('Failed to load available ride requests');
    }
  };

  // Load available ride requests on component mount
  useEffect(() => {
    loadAvailableRequests();
  }, []);

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

        <div className="available-requests">
          <h3>Available Ride Requests:</h3>
          {availableRequests.length > 0 ? (
            <ul>
              {availableRequests.map((request) => (
                <li key={request._id} className="ride-item">
                  <div>
                    <strong>From:</strong> {request.pickupLocation} <br />
                    <strong>To:</strong> {request.destination} <br />
                    <strong>Time:</strong> {new Date(request.time).toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleMatchRide(request._id)}
                    className="btn match-btn"
                  >
                    Match with This Request
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No ride requests available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

