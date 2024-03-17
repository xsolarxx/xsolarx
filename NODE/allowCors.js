// Import necessary modules
const express = require("express");
const app = express();

// Middleware to allow CORS
const allowCors = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://frontend-iota-three-81.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next(); // Pass control to the next middleware
};

// Apply the CORS middleware to all routes
app.use(allowCors);

// Define your API endpoint handler
app.get("/api/v1/users/login", (req, res) => {
  const d = new Date();
  res.send(d.toString());
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
