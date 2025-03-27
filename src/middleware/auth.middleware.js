import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const authMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "no token found" });

  const jwtToken = token.replace("Bearer ", "").trim();
  console.log("token from auth middleware", jwtToken);

  try {
    const isVerified = jwt.verify(jwtToken, process.env.ACCESS_JWT_SECRET);
    console.log("isVerified", isVerified);

    const userData = await User.findOne({ email: isVerified.email }).select({
      password: 0,
    });
    console.log(userData);
    req.user = userData; // Assigning userData to req.user
    req.token = token;
    next();
  } catch (error) {}
};

export default authMiddleware;
// import jwt from "jsonwebtoken";
// import { User } from "../models/user.models.js";

// const authMiddleware = async (req, res, next) => {
//   const token = req.header["Authorization"]; // Correct way to get the header
//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Unauthorized HTTP,Token not provided " });
//   }

//   const jwtToken = token.replace("Bearer", "").trim();
//   console.log("Token from auth middleware:", jwtToken);

//   try {
//     const isVerified = jwt.verify(jwtToken, process.env.ACCESS_JWT_SECRET);
//     console.log(isVerified);
//     next();
//   } catch (error) {}

//   //
// };

// export default authMiddleware;
