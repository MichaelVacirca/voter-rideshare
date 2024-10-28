import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [rides, setRides] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await axios.get('/api/rides/myrides', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRides(response.data);
      } catch (err) {
        console.error(err);
        alert('Failed to load rides');
      }
    };
    fetchRides();
  }, [token]);

  return (
    <div>
      <h2>My Rides</h2>
      {rides.length > 0 ? (
        <ul>
          {rides.map((ride) => (
            <li key={ride._id}>
              {ride.rideType} from {ride.location} to {ride.destination} at {new Date(ride.time).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No rides available</p>
      )}
    </div>
  );
};

export default Dashboard;
