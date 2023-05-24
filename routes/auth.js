const express = require("express");
const router = new express.Router();

const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");
const { SECRET_KEY } = require("../config");

const User = require("../models/user");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (await User.authenticate(username, password)) {
      // update last login
      User.updateLoginTimestamp(username);
      // create and return token
      let token = jwt.sign({ username }, SECRET_KEY);
      return res.json({ token });
    } else {
      throw new ExpressError("Invalid Username/Password");
    }
  } catch (e) {
    next(e);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, phone } = req.body;

    await User.register({ username, password, first_name, last_name, phone });

    // return token
    let token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  } catch (e) {
    // if unique constraint is not met
    if (e.code === "23505") {
      next(new ExpressError("Username taken, please pick another", 400));
    }
    next(e);
  }
});

module.exports = router;
