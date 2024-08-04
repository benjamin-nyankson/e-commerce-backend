const jwt = require('jsonwebtoken');
const database = require("../Database/MongoDB");


const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

/**
 * Encodes data into a JSON Web Token (JWT).
 * @param {Object} data - The data to be encoded into the token.
 * @param {string} [expiresIn='60s'] - The expiration time of the access token (default is 60 seconds).
 * @param {string} [type='access'] - Type of token ('access' or 'refresh').
 * @returns {Promise<string>} - A promise that resolves to the encoded token.
 */
const encodeData = async (data, expiresIn = '60s', type = 'access') => {
  const secret = type === 'refresh' ? REFRESH_SECRET : JWT_SECRET;
  return new Promise((resolve, reject) => {
    jwt.sign(data, secret, { expiresIn }, (err, token) => {
      if (err) {
        console.error('Error encoding data:', err);
        reject(new Error('Could not generate token'));
      } else {
        resolve(token);
      }
    });
  });
};

const storeRefreshToken = async (userId, refreshToken) => {
    // Store the refresh token in your database associated with the user
    // Example:
    await database.refreshTokensCollection.updateOne(
      { userId },
      { $set: { refreshToken } },
      { upsert: true }
    );
  };

  const validateRefreshToken = async (refreshToken) => {
    return new Promise((resolve, reject) => {
      jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
        if (err) {
          reject(new Error('Invalid refresh token'));
        } else {
          resolve(decoded);
        }
      });
    });
  };
  


const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err); // Token verification failed, e.g., expired or invalid
      } else {
        resolve(decoded); // Token is valid
      }
    });
  });
};

  
module.exports={encodeData,storeRefreshToken, validateRefreshToken, verifyToken}
