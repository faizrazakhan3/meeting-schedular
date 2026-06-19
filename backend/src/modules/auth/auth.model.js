const db = require("../../config/db");

const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM users WHERE email = ?";

    db.query(
      sql,
      [email],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      }
    );
  });
};

const createUser = (
  name,
  email,
  hashedPassword
) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO users(name,email,password) VALUES(?,?,?)";

    db.query(
      sql,
      [
        name,
        email,
        hashedPassword,
      ],
      (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      }
    );
  });
};

module.exports = {
  findUserByEmail,
  createUser,
};