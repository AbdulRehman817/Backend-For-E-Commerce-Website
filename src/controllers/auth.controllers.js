import { Customer } from "../models/customer.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// get user detail
const user = async (req, res) => {
  try {
    console.log("🔹 [user] req.user =", req.user);
    const UserData = req.user;
    return res.status(200).json({ data: UserData });
  } catch (error) {
    console.log("❌ error from user route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// generate tokens
const generateAccessToken = (user) => {
  console.log("🔹 Generating access token for:", user.email);
  return jwt.sign({ email: user.email }, process.env.ACCESS_JWT_SECRET, {
    expiresIn: "6h",
  });
};

const generateRefreshToken = (user) => {
  console.log("🔹 Generating refresh token for:", user.email);
  return jwt.sign({ email: user.email }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });
};

// register user
const registerUser = async (req, res) => {
  console.log("📩 Register request body:", req.body);

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    console.log("⚠️ Missing fields");
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await Customer.findOne({ email });
    console.log("🔎 Existing user check:", existingUser);

    if (existingUser) {
      return res.status(401).json({ message: "User already exists" });
    }

    console.log("🛠 Creating user in DB...");
    const createUser = await Customer.create({
      email,
      password, // model will hash it automatically
      name,
    });

    console.log("✅ User created:", createUser);

    res.status(201).json({
      message: "User registered successfully",
      data: {
        _id: createUser._id,
        name: createUser.name,
        email: createUser.email,
      },
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// login user
const loginUser = async (req, res) => {
  console.log("📩 Login request body:", req.body);

  const { email, password } = req.body;
  if (!email) return res.status(400).json({ message: "email required" });
  if (!password) return res.status(400).json({ message: "password required" });

  try {
    const user = await Customer.findOne({ email });
    console.log("🔎 Found user:", user);

    if (!user) return res.status(404).json({ message: "no user found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔑 Password valid?", isPasswordValid);

    if (!isPasswordValid)
      return res.status(400).json({ message: "incorrect password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    console.log("✅ Tokens generated");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // change to true if using HTTPS
      sameSite: "strict",
    });

    res.json({
      message: "user loggedIn successfully",
      accessToken,
      refreshToken,
      data: user,
    });
  } catch (error) {
    console.error("❌ Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// logout user
const logoutUser = async (req, res) => {
  console.log("🔹 Logging out user...");
  res.clearCookie("refreshToken");
  res.json({ message: "user logout successfully" });
};

// refresh token
const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  console.log("📩 Refresh token request:", token);

  if (!token)
    return res.status(401).json({ message: "no refresh token found!" });

  try {
    const decodedToken = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
    console.log("🔑 Decoded token:", decodedToken);

    const user = await Customer.findOne({ email: decodedToken.email });
    console.log("🔎 User found from refresh token:", user);

    if (!user) return res.status(404).json({ message: "invalid token" });

    const newAccessToken = generateAccessToken(user);
    res.json({
      message: "access token generated",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("❌ Error refreshing token:", error);
    res.status(401).json({ message: "invalid or expired refresh token" });
  }
};

export { registerUser, loginUser, logoutUser, refreshToken, user };
