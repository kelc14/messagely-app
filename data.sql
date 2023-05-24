DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS messages;

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users,
    to_username text NOT NULL REFERENCES users,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone
);

-- INSERT INTO users (username,password,first_name, last_name, phone, join_at)
-- VALUES ('TestUser', 'password', 'Jane', 'Doe', '12345678'),
--  ('TestUser2', 'password', 'Johnny', 'Walker', '123455678'),
--  ('TestUser3', 'password', 'Purple', 'Rain', '12345678');

INSERT INTO messages (from_username, to_username, body)
VALUES ('TestUser', 'TestUser1', 'This is a test message.')
 ('TestUser1', 'TestUser2', 'This is another test message.')
 ('TestUser2', 'TestUser', 'This is a third test message.')
