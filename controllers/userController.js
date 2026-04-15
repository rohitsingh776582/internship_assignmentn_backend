const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { full_name, email, password, admin_secret_code } = req.body;

    const userExist = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = "user";
    if (admin_secret_code === "ADMIN123") {
      role = "admin";
    }

    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, password, role, admin_secret_code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, hashedPassword, role, admin_secret_code]
    );

    res.status(201).json({
      message: "User created successfully",
      user: newUser.rows[0],
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password, admin_secret_code } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    // password check
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // admin check
    if (user.role === "admin") {
      if (!admin_secret_code || admin_secret_code !== user.admin_secret_code) {
        return res.status(403).json({ message: "Invalid admin secret code" });
      }
    }

    // token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    //  sensitive fields remove
    delete user.password;
    delete user.admin_secret_code;

    res.json({
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

