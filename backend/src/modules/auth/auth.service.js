const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const {
  findUserByEmail,
  createUser,
} = require("./auth.model");

const loginUser = (
  email,
  password
) => {
  return new Promise(
    async (resolve, reject) => {
      try {
        const result =
          await findUserByEmail(email);

        if (result.length === 0) {
          return reject({
            status: 401,
            message:
              "Invalid Email or Password",
          });
        }

        const user = result[0];

        const isMatch =
          await bcrypt.compare(
            password,
            user.password
          );

        if (!isMatch) {
          return reject({
            status: 401,
            message:
              "Invalid Email or Password",
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );

        resolve({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      } catch (err) {
        reject({
          status: 500,
          message:
            "Database Error",
        });
      }
    }
  );
};

const registerUser = (
  name,
  email,
  password
) => {
  return new Promise(
    async (resolve, reject) => {
      try {
        if (name.length < 3) {
          return reject({
            status: 400,
            message:
              "Name must be at least 3 characters",
          });
        }

        if (!email.includes("@")) {
          return reject({
            status: 400,
            message:
              "Invalid Email",
          });
        }

        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (
          !passwordRegex.test(password)
        ) {
          return reject({
            status: 400,
            message:
              "Password must contain uppercase, lowercase, number and be at least 8 characters long",
          });
        }

        const existingUser =
          await findUserByEmail(
            email
          );

        if (
          existingUser.length > 0
        ) {
          return reject({
            status: 400,
            message:
              "User already exists",
          });
        }

        const hashedPassword =
          await bcrypt.hash(
            password,
            10
          );

        await createUser(
          name,
          email,
          hashedPassword
        );

        resolve({
          message:
            "User Registered",
        });
      } catch (err) {
        reject({
          status: 500,
          message:
            "Database Error",
        });
      }
    }
  );
};

module.exports = {
  loginUser,
  registerUser,
};