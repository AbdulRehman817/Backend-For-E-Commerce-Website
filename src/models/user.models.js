// // import mongoose from "mongoose";
// // import bcrypt from "bcrypt";
// // const userSchema = new mongoose.Schema(
// //   {
// //     name: {
// //       type: String,
// //       required: true,
// //     },
// //     email: {
// //       type: String,
// //       required: true,
// //     },
// //     password: {
// //       type: String,
// //       required: true,
// //     },
// //     // role: {
// //     //   type: String,
// //     //   required: true,
// //     //   enum: ["user", "admin"],
// //     // },
// //     enrolledproducts: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Product",
// //     },
// //   },
// //   {
// //     timestamps: true,
// //   }
// // );
// // userSchema.pre(
// //   "save",
// //   async function (next) {
// //     if (!this.isModified("password")) return next();
// //     this.password = await bcrypt.hash(this.password, 10);
// //     next();
// //   },
// //   {}
// // );

// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//   },
//   { timestamps: true }
// );
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }, // For authorization
    enrolledproducts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", UserSchema);
