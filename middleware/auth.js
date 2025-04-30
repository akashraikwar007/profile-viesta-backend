const jwt = require("jsonwebtoken");
const User = require("../models/user");

function verifyJWT(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid authorization format. Use 'Bearer <token>'" });
    }

    const token = parts[1];
    console.log(
      'token:', token,
      'parts:', parts,
    );
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (!process.env.SECRET_KEY) {
      console.error("SECRET_KEY is not defined in environment variables");
      return res.status(500).json({ message: "Internal server error" });
    }

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token has expired" });
        }
        return res.status(401).json({ message: "Invalid token" });
      }


      // Optional: Verify the user exists in the database
      try {
        console.log('Decoded data:', data);

        // const user = await User.findById(data.id); // Assuming the token contains the user ID
        // console.log('User found:', user);
        // if (!user) {
        //   return res.status(404).json({ message: "User not found" });
        // }
        req.user = {_id:data.id}; // Attach the user object to the request
        next();
      } catch (dbError) {
        console.error("Database error:", dbError);
        return res.status(500).json({ message: "Internal server error" });
      }
    });
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = verifyJWT;