import mongoose from "mongoose";
import { Product } from "../models/products.models.js";
import fs from "fs";
import dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";

dotenv.config();

const imageToUrl = async (filepath, filename) => {
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(filepath);

    // Prepare the form data for Imgur API
    const form = new FormData();
    form.append("image", imageBuffer, { filename });
    form.append("type", "file");

    // Upload image to Imgur
    const imgurResponse = await axios.post(
      "https://api.imgur.com/3/image",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: "Client-ID bedbf25d467357d", // Replace with your actual Client-ID
        },
      }
    );

    // Remove the image file after successful upload
    await removeImageFile(filepath);

    // Ensure the response contains a valid image URL
    if (
      imgurResponse.data &&
      imgurResponse.data.data &&
      imgurResponse.data.data.link
    ) {
      return imgurResponse.data.data.link;
    } else {
      throw new Error("Imgur upload failed: No valid link received");
    }
  } catch (error) {
    console.error("Error uploading to Imgur:", error.message);
    return null;
  }
};

// Helper function to remove uploaded image file after processing
const removeImageFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
    console.log("File successfully deleted:", filePath);
  } catch (error) {
    console.error("Error deleting file:", error.message);
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    const { name, price, MoreAbout, Category } = req.body;

    // Validate required fields
    if (!name || !price) {
      return res
        .status(400)
        .json({ message: "Name and price are required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image provided!" });
    }

    // Convert image to URL
    const image = await imageToUrl(req.file.path, req.file.originalname);
    if (!image) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    // Create a new product
    const product = new Product({
      name,
      price,
      MoreAbout,
      image,
      Category,
    });

    await product.save();

    return res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while adding the product",
      error: error.message,
    });
  }
};

// Get all products
const getallProducts = async (req, res) => {
  try {
    const products = await Product.find();
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
    const product = await Product.findById(id);
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
    keyFeatures,

    productFeatures,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  // Validate required fields
  // if (!name || !price || !oldPrice || !keyFeatures) {
  //   return res.status(400).json({ message: "All fields are required" });
  // }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.productFeatures = productFeatures;

    product.keyFeatures = keyFeatures;

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

const getProductsByCategory = async (req, res) => {
  try {
    // Extract category name
    const { categoryName } = req.params;

    // Ensure categoryName is present
    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Log categoryName for debugging
    console.log("Category Name:", categoryName);

    // Fetch products from DB
    const products = await Product.find({
      category: decodeURIComponent(categoryName),
    });

    // Return response
    res
      .status(200)
      .json({ message: "Products fetched successfully", products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// getProductsByCategory("Audio & Video");
export {
  addProduct,
  getallProducts,
  getSingleProduct,
  editProduct,
  getProductsByCategory,
};
