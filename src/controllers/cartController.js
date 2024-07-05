const Cart = require('../models/cart');

exports.removeProduct = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user._id; // Assuming you have user info in req.user

  try {
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).send('Cart not found');
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    await cart.save();
    console.log("product removed from cart succesfully")
    res.redirect('/shoppingcart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
