const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchRides = async (token) => {
  const response = await fetch(`${API_URL}/rides/available`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch rides');
  return response.json();
};

export const createRideRequest = async (rideData, token) => {
  const response = await fetch(`${API_URL}/rides`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(rideData)
  });
  if (!response.ok) throw new Error('Failed to create ride request');
  return response.json();
};