// import mongoose from "mongoose";

// const cartSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // Reference to User model
//       required: true,
//     },
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product", // Reference to Product model
//       required: true,
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       default: 1,
//     },
//   },
//   { timestamps: true }
// );

import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      BestDealproductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
    },
  ],
});
export const Cart = mongoose.model("Cart", cartSchema);
