/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    // get the token, and verify authenticity using secret key
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    // create a current user from payload (if it exists)
    req.user = payload;
    return next();
  } catch (err) {
    // otherwise if there is an error, just go on to the next thing
    return next();
  }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    // if there is no user in the req body then there is no user logged in -> throw error
    return next({ status: 401, message: "Unauthorized" });
  } else {
    // otherwise, a user is logged in so go ahead and authenticate
    return next();
  }
}

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    // if the username matches the input username, go ahead and go on
    if (req.user.username === req.params.username) {
      return next();
    } else {
      // otherwise the logged in user should not be accessing this information
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined (no user logged in)
    return next({ status: 401, message: "Unauthorized" });
  }
}
// end

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
};
