const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const userRouter = require('./routes/user')
const connectMongoDB = require('./connection')
const { logReqRes } = require('./middleware')
// Auth route
const authRouter = require('./routes/auth');
// Auth Middleware
const verifyJWT = require("./middleware/auth")
require('dotenv').config()

// connection
connectMongoDB(process.env.MONGO_URL).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.log("Error connecting to MongoDB", err);
});

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logReqRes("log.txt"));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// user Router
app.use("/api/user", verifyJWT,  userRouter)


// auth section

// Check for required environment variables
if (!process.env.MONGO_URL) {
  console.error("MONGO_URL is not defined in environment variables");
  process.exit(1);
}

if (!process.env.SECRET_KEY) {
  console.error("SECRET_KEY is not defined in environment variables");
  process.exit(1);
}


//Authentication route
app.use('/auth', authRouter);

//decodeDetails Route
app.get('/decodeDetails', verifyJWT, (req, res) => {
  try {
    const { username } = req.user;
    res.json({ username });
  } catch (error) {
    console.error('Decode details error:', error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: "Validation error", 
      details: err.message 
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: "Invalid token", 
      details: err.message 
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: "Token expired", 
      details: err.message 
    });
  }
  
  // Default error response
  res.status(500).json({ 
    message: "Something went wrong!", 
    details: err.message 
  });
});



// Auth section end

// Start server
const PORT = 8000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
