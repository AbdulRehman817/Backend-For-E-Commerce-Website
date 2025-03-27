import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be a positive number"],
    },
    keyFeatures: {
      type: [String],
    },
    category: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    productFeatures: {
      type: [String],
    },
    MoreAbout: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export const Product = mongoose.model("Product", ProductSchema);

//yeh 2 model kyn
