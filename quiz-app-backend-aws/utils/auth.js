const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "quiz-platform-secret-key";

function verifyToken(event) {

  const authHeader =
    event.headers?.Authorization ||
    event.headers?.authorization;

  if (!authHeader) {
    throw new Error(
      "Authorization token missing"
    );
  }

  const token =
    authHeader.replace(
      "Bearer ",
      ""
    );

  return jwt.verify(
    token,
    JWT_SECRET
  );
}

module.exports = {
  verifyToken
};