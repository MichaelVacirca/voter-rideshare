# Voter Rideshare API

This is the backend API for the Voter Rideshare project, allowing users to request and offer rides to voting locations.

## Features
- User Registration and Authentication (JWT-based)
- Create and manage ride requests/offers
- Find matching rides
- Cancel rides

## Getting Started

### Prerequisites
- Node.js and npm
- MongoDB (can be hosted with MongoDB Atlas)

### Setup
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file with your MongoDB URI and JWT Secret.
4. Start the server: `npm start`.

### API Endpoints
- `POST /api/users/register` - Register a new user.
- `POST /api/users/login` - Login and get a JWT token.
- `POST /api/rides` - Create a new ride (authenticated).
- `GET /api/rides/matches` - Get ride matches (authenticated).
- `DELETE /api/rides/:id` - Cancel a ride (authenticated).
