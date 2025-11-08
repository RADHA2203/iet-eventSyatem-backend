const jwt = require("jsonwebtoken");

// Optional authentication - doesn't fail if no token provided
// If token is present and valid, req.user will be set
// If no token or invalid token, req.user remains undefined and request continues
module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  // If no token or empty token, just continue without setting req.user
  if (!token || token === "") {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Invalid token - just continue without setting req.user
    // Don't send error response, just proceed
    next();
  }
};
