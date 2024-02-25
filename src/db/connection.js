
const mongoose = require("mongoose");


// creating database
mongoose.connect("mongodb://127.0.0.1:27017/travelmate",{
  useNewUrlParser:true,
  useUnifiedTopology : true
}).then(()=>{
    console.log("connection to mongodb is successful");
}).catch((error)=>{
    console.log(error)
})


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