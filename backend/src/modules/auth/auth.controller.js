const {
  loginUser,
  registerUser,
} = require("./auth.service");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(
      email,
      password
    );

    res.json({
      message: "Login Success",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } =
      req.body;

    const result = await registerUser(
      name,
      email,
      password
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message,
    });
  }
};

module.exports = {
  login,
  register,
};