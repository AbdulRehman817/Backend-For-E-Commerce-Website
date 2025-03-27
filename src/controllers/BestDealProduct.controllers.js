import mongoose from "mongoose";
import { BestDealProduct } from "../models/BestDealProducts.models.js";
import fs from "fs";
import dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";

dotenv.config();

// Function to upload image to Imgur
const imageToUrl = async (filepath, filename) => {
  try {
    const imageBuffer = fs.readFileSync(filepath);

    const form = new FormData();
    form.append("image", imageBuffer, { filename });
    form.append("type", "file");

    const imgurResponse = await axios.post(
      "https://api.imgur.com/3/image",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: "Client-ID bedbf25d467357d", // Replace with your actual Imgur Client-ID
        },
      }
    );

    removeImageFile(filepath);
    return imgurResponse.data.data.link;
  } catch (error) {
    console.error("Error uploading to Imgur:", error.message);
    return null;
  }
};

// Helper function to remove uploaded image file after processing
const removeImageFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
    console.log("File successfully deleted:", filePath);
  } catch (error) {
    console.error("Error deleting file:", error.message);
  }
};

// Add a new product
const addProduct = async (req, res) => {
  const { name, price, oldPrice } = req.body;

  // Validate required fields
  if (!name || !price || !oldPrice) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No Image Found!" });
  }

  const image = await imageToUrl(req.file.path, req.file.originalname);
  if (!image) {
    return res.status(500).json({ message: "Error while uploading image" });
  }

  try {
    const product = new BestDealProduct({ name, price, oldPrice, image });
    await product.save();

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding product",
      error: error.message,
    });
  }
};

// Get all products
const getallProducts = async (req, res) => {
  try {
    const products = await BestDealProduct.find();
    res.status(200).json({
      message: "All products retrieved successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving products",
      error: error.message,
    });
  }
};

// Get a single product by ID
const getSingleProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await BestDealProduct.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving product",
      error: error.message,
    });
  }
};

// Edit an existing product
const editProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    price,
    oldPrice,
    keyFeatures,
    Category,
    productFeatures,
    MoreAbout,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  // Validate required fields
  // if (!name || !price || !oldPrice || !keyFeatures) {
  //   return res.status(400).json({ message: "All fields are required" });
  // }

  try {
    const product = await BestDealProduct.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.file) {
      const image = await imageToUrl(req.file.path, req.file.originalname);
      if (!image) {
        return res.status(500).json({ message: "Error while uploading image" });
      }
      product.image = image;
    }
    // product.productFeatures = productFeatures;
    product.MoreAbout = MoreAbout;
    // product.name = name;
    // product.price = price;
    // product.oldPrice = oldPrice;
    // product.keyFeatures = keyFeatures;
    // product.Category = Category;
    //
    await product.save();
    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};

export { addProduct, getallProducts, getSingleProduct, editProduct };
