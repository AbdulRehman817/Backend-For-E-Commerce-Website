import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import categoryModels from "../models/category.models.js";

// 🔹 Upload Image to Imgur
const uploadImageToImgur = async (filePath, fileName) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const form = new FormData();
    form.append("image", imageBuffer, { filename: fileName });
    form.append("type", "file");

    const response = await axios.post(
      "https://api.imgur.com/3/image",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: "Client-ID bedbf25d467357d", // Replace with your actual Imgur Client-ID
        },
      }
    );

    // Remove file after upload
    fs.unlinkSync(filePath);

    return response.data.data.link; // Return the uploaded image URL
  } catch (error) {
    console.error("Error uploading image:", error.message);
    return null;
  }
};

// 🔹 Add a New Category
const addCategory = async (req, res) => {
  try {
    const { name, slug, products } = req.body;
    let imageUrl = req.body.image; // Get image from request body (if provided)

    // If file is uploaded, upload it to Imgur
    if (req.file) {
      imageUrl = await uploadImageToImgur(req.file.path, req.file.filename);
      if (!imageUrl) {
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    // Save category in DB
    const newCategory = new categoryModels({
      name,
      slug,
      image: imageUrl,
      products,
    });

    await newCategory.save();
    res.status(201).json({ message: "Category added successfully!", category: newCategory });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Get All Categories
const getCategories = async (req, res) => {
  try {
    const categories = await categoryModels.find();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export { addCategory, getCategories };











//[
  //     name: "Air Conditioner",
  //     image:
  //       "https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-category-image-06.jpg",
  //     slug: "air-conditioner",
  //     products: 4, // Changed from string to number
  //   },
  //   {
  //     name: "Audio & Video",
  //     image:
  //       "https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-category-image-08.jpg",
  //     slug: "audio-video",
  //     products: 5,
  //   },
  //   {
  //     name: "Gadgets",
  //     image:
  //       "https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-category-image-02.jpg",
  //     slug: "gadgets",
  //     products: 6,
  //   },
  //   {
  //     name: "Kitchen Appliances",
  //     image:
  //       "https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-category-image-05.jpg",
  //     slug: "kitchen-appliances",
  //     products: 6,
  //   },
  //   {
  //     name: "PCs & Laptop",
  //     image:
  //       "https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-category-image-03.jpg",
  //     slug: "pcs-laptop", // Fixed slug formatting
  //     products: 4,
  //   },
  //   {
  //     name: "Refrigerator",
  //     image:
  //       "https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-category-image-04.jpg",
  //     slug: "refrigerator",
  //     products: 4,
  //   },
  //   {
  //     name: "Smart Home",
  //     image:
  //       "https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-category-image-01.jpg",
  //     slug: "smart-home", // Fixed slug formatting
  //     products: 5,
  //   },
  //   {
  //     name: "Home Appliances",
  //     image:
  //       "https://websitedemos.net/electronic-store-04/wp-content/uploads/sites/1055/2022/03/electronic-store-category-image-07.jpg",
  //     slug: "home-appliances", // Fixed slug formatting
  //     products: 5,
  //   },
  // ];
