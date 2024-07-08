const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  productType:String,
});

// Create and export the Product model
module.exports = mongoose.model('Product', productSchema);