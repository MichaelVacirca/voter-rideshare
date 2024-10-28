// src/server.js

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (optional)
app.use(express.json());

// Root route to serve a response at "/"
app.get('/', (req, res) => {
  res.send('Welcome to Voter Rideshare!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
