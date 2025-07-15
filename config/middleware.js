const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authenticationHeader = req.headers['authorization'];
  const token = authenticationHeader && authenticationHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'Your access to this endpoint is denied!. Please provide a token' });
  }

  const secretKey = process.env.ACCESS_TOKEN_SECRET

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {

      console.log('errr names ---->', err.name);

      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: 'Invalid token' });
      } else {
        return res.status(400).json({ message: 'Token verification failed', error: err.message });
      }
    }
    console.log('decode---->', decoded); 

    req.user = decoded; 
    next();
  });
};

const renewAccessGrant = (req, res, next) => {

  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ message: 'Please provide a refresh token' });
  
  const secretKey = process.env.REFRESH_TOKEN_SECRET

  jwt.verify(token, secretKey, (err, decoded) => {

    console.log('user decoded --->', decoded);
   
    if(err) return res.status(403).json({ message: 'Invalid or Expired token please login again' });
    req.user = decoded; 
    next();
    
  });
};

module.exports = {
  authenticateToken,
  renewAccessGrant
}
