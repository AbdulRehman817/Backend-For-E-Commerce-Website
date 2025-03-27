import { Cart } from "../models/cart.models.js";
import { Product } from "../models/products.models.js";
// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ message: "Missing productId or quantity" });
    }

    // Check if the product exists in the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Example: Add product to user's cart
    const cartItem = new Cart({ productId, quantity, userId: req.user.id });
    await cartItem.save();

    res.status(201).json({ message: "Added to cart successfully", cartItem });
  } catch (error) {
    console.error("Error in /cart route:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get cart for logged-in user
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.json({ items: [] });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart" });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error removing item from cart" });
  }
};

export { removeFromCart, getCart, addToCart };
