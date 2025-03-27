import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  image: { type: String, required: true },
  products: { type: Number, required: true },
});

export default mongoose.model("Category", categorySchema);
