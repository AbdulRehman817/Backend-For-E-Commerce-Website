import mongoose from "mongoose";

const BestDealProductSchema = new mongoose.Schema(
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
    oldPrice: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be a positive number"],
    },

    keyFeatures: {
      type: [String],
    },
    Category: {
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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export const BestDealProduct = mongoose.model(
  "BestDealProduct",
  BestDealProductSchema
);

//yeh 2 model kyn
