const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../db");
const ExpressError = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
} = require("../middleware/auth");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** User class for message.ly */

/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register(username, password, first_name, last_name, phone) {
    if (!username || !password || !first_name || !last_name || !phone) {
      throw new ExpressError("Missing information.");
    }
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (
              username,
              password, 
              first_name, 
              last_name, 
              phone,
              join_at)
            VALUES ($1, $2, $3, $4, $5, current_timestamp)
            RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return result;
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );
    let user = results.rows[0];

    if (!user) throw new ExpressError("Invalid Username/Password");

    let result = await bcrypt.compare(password, user.password);

    if (result === true) return true;
    else {
      throw new ExpressError("Invalid Username/Password");
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    let results = await db.query(
      `UPDATE users 
    SET last_login_at = current_timestamp
    WHERE username = $1 
    RETURNING username, last_login_at`,
      [username]
    );

    let user = results.rows[0];

    if (!user) throw new ExpressError("Invalid Username/Password");
    return;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(`
    SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users`);
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(
      `
    SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username = $1`,
      [username]
    );
    let user = results.rows[0];
    if (!user) throw new ExpressError("User not found.");
    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    let results = await db.query(
      `SELECT m.id,
                m.to_username,
                t.first_name AS to_first_name,
                t.last_name AS to_last_name,
                t.phone AS to_phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
            JOIN users AS t ON m.to_username = t.usernameWHERE m.from_username = $1
            `,
      [username]
    );
    let messages = results.rows;

    const msgs = [];
    for (let i = 0; i < messages.length; i++) {
      let msgDetails = {
        id: messages[i].id,
        to_user: {
          username: messages[i].to_username,
          first_name: messages[i].to_first_name,
          last_name: messages[i].to_last_name,
          phone: messages[i].to_phone,
        },
        body: messages[i].body,
        sent_at: messages[i].sent_at,
        read_at: messages[i].read_at,
      };
      msgs.push(msgDetails);
    }
    return msgs;
  }

  // /** Return messages to this user.
  //  *
  //  * [{id, from_user, body, sent_at, read_at}]
  //  *
  //  * where from_user is
  //  *   {username, first_name, last_name, phone}
  //  */

  static async messagesTo(username) {
    let results = await db.query(
      `SELECT m.id,
                m.from_username,
                t.first_name AS from_first_name,
                t.last_name AS from_last_name,
                t.phone AS from_phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
            JOIN users AS t ON m.from_username = t.username
          WHERE m.to_username = $1
          `,
      [username]
    );
    let messages = results.rows;

    const msgs = [];
    for (let i = 0; i < messages.length; i++) {
      let msgDetails = {
        id: messages[i].id,
        to_user: {
          username: messages[i].from_username,
          first_name: messages[i].from_first_name,
          last_name: messages[i].from_last_name,
          phone: messages[i].from_phone,
        },
        body: messages[i].body,
        sent_at: messages[i].sent_at,
        read_at: messages[i].read_at,
      };
      msgs.push(msgDetails);
    }
    return msgs;
  }
}

module.exports = User;
