// connection.js

const mongoose = require("mongoose");
require('dotenv').config();

// Use environment variable for MongoDB Atlas connection string
const uri = process.env.ATLAS_URI;



// Connect to MongoDB Atlas
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connection to MongoDB Atlas is successful");
}).catch((error) => {
  console.error("Error connecting to MongoDB Atlas:", error);
});


// // Define your product schema and model
// const productSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   price: Number,
//   imageUrl: String,
// });

// const Product = mongoose.model('Product', productSchema);
// // app.listen(port, () => {
// //   console.log(`Server is running on port ${port}`);
// // });

module.exports = mongoose.connection;