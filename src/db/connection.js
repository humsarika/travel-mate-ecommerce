const mongoose = require("mongoose");

require('dotenv').config();

// Use environment variable for MongoDB Atlas connection string
const uri = process.env.ATLAS_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connection to MongoDB Atlas is successful");
}).catch((error) => {
  console.error("Error connecting to MongoDB Atlas:", error);
});



module.exports = mongoose.connection;