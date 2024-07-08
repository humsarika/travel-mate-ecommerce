const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("express-flash");
const authMiddleware = require('./middleware/auth');
const path = require("path");
require("./db/connection");
const Product = require("./models/products");
const cartItem = require("./models/cart");
const User = require("./models/user");
const hbs = require("hbs");
const bodyParser = require("body-parser");
// const cors = require("cors");

const methodOverride = require("method-override");
const cartRoutes = require("./routes/cart");

// const bcrypt = require('bcrypt');
const app = express();

const port = process.env.PORT || 3000;


// setting the path for css file
const staticpath = path.join(__dirname, "../public");

const templatepath = path.join(__dirname, "../templates/views");
const partialpath = path.join(__dirname, "../templates/partials");

// middleware
app.use(authMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(staticpath));
app.use(bodyParser.json());
// app.use(cors());
app.set("view engine", "hbs");
app.set("views", templatepath);
hbs.registerPartials(partialpath);
app.use(flash());
app.use(authMiddleware);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, //not saving session data if nothing has changed
    saveUninitialized: true, // Saving session data for new sessions
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure the Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (user) {
          if (user.password === password) {
            console.log(`User ${user.email} logged in successfully.`);
            return done(null, user);
          } else {
            console.log(
              `Login attempt failed for user ${user.email}. Incorrect password.`
            );
            return done(null, false, { message: "Incorrect password" });
          }
        } else {
          console.log(
            `Login attempt failed. User with email ${email} not found.`
          );
          return done(null, false, { message: "User not found" });
        }
      } catch (error) {
        console.error(`Error during login: ${error}`);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .exec()
    .then((user) => {
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    })
    .catch((err) => {
      return done(err);
    });
});

// variables
// const userId = null;
// const saltRounds = 10;

// routes
// app.get(path , callback function)



// display home page
app.get("/", (req, res) => {
  res.render("index", { isAuthenticated: req.isAuthenticated(),  user: req.user });
});

app.get("/aboutus", (req, res) => {
  // display about page
  res.render("aboutus", { isAuthenticated: req.isAuthenticated() });
});
// app.get("/shoppingcart", (req, res) => {
//   //display shopping cart
//   res.render("shoppingcart",{ isAuthenticated: req.isAuthenticated() });
// });
app.get("/login", (req, res) => {
  //display login page
  res.render("login");
});
app.get("/signup", (req, res) => {
  //display signup page
  res.render("signup");
});

// Creating a route to retrieve and display products
app.get("/products", (req, res) => {
  Product.find({})
    .limit(50)
    .then((products) => {
      res.render("allproducts", {
        products,
        isAuthenticated: req.isAuthenticated(),
      });

      // res.json(products); // res.json() to send JSON response
    })
    .catch((err) => {
      console.error("Error retrieving products:", err);
      res.status(500).json({ error: "Could not retrieve products" });
    });
});

// Creating a route to retrieve and display products by category
app.get("/products/:category", async (req, res) => {
  const category = req.params.category;

  try {
    const query = { category: category };

    const products = await Product.find(query);

    res.render("allproducts", {
      products,
      currentCategory: category,
      isAuthenticated: req.isAuthenticated(),
    });
  } catch (err) {
    console.error("Error retrieving products:", err);
    res.status(500).json({ error: "Could not retrieve products" });
  }
});

// app.get('/getcartItems', async (req, res) => {
//   try {
//     const cartItems = await cartItem.find({}); // Fetch all cart items from the database

//     // Render the cart.hbs template with the cartItems data
//     res.render('shoppingcart', { cartItems });
//   } catch (error) {
//     console.error('Error fetching cart items:', error);
//     res.status(500).send('An error occurred while fetching cart items.');
//   }
// });
// user authentication
const authenticateUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login"); // Redirect to login page if not authenticated
};

app.get("/shoppingcart", authenticateUser, async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userId = req.user._id;

    // Fetch the cart items for the user and populate product details
    const cart = await cartItem.findOne({ userId }).populate({
      path: "items.productId",
      select: "name price imageUrl",
    });

    if (!cart) {
      return res
        .status(404)
        .render("emptycart", { isAuthenticated: req.isAuthenticated() });
    }

    // Calculate the total cart price
    const total = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.productId.price,
      0
    );

    // Render the shopping cart page with cart items and total
    res.render("shoppingcart", {
      cartItems: cart.items,
      total,
      isAuthenticated: req.isAuthenticated(),
    });
  } catch (error) {
    console.error("Error getting cart items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// display product by id route
app.get("/product/:productId", async (req, res) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log("product not found");
      return res.status(404).json({ error: "Product not found" });
    }
    console.log(product);
    res.render("product", { product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// const newProduct = new Product({
//   name: 'hoodie-men-2',
//   description: 'hoodie for MEN ',
//   price: 1300,
//   imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/81lLBN5W3iL._AC_UL1500_.jpg',
// });

// newProduct.save()
//   .then((savedProduct) => {
//     console.log('Product saved successfully:', savedProduct);
//   })
//   .catch((err) => {
//     console.error('Error saving product:', err);
//   });

// Handling user registration

// Inside the user registration route

app.post("/usersignup", async (req, res) => {
  const userData = req.body;
  const { email } = userData;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("user already exist");
      return res.status(400);
    }

    const newUser = new User(userData);

    await newUser.save();
    res.redirect("/login");
    res.status(200);
    console.log("user registered susscessfully");
  } catch (error) {
    console.error(error);
    res.status(500);
    res.redirect("/signup");
    console.log("Registration failed. Please try again.");
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/?user=:user",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
      // console.log('Logout failed');
    }
    res.redirect("/");
    console.log("Logout successful");
    // Redirect to the login page after logout
  });
});

//add-to-cart route
app.post("/add-to-cart", async (req, res) => {
  console.log("User:", req.user.name);

  const {productId, size, quantity, price } = req.body;
  console.log("Request to add to cart:", req.body);

  try {
    // Find or create user's cart
    let cart = await cartItem.findOne({ userId });

    if (!cart) {
      cart = new cartItem({ userId });
    }

    // Checking if the product is already in the user's cart
    const existingCartItem = cart.items.find(
      (item) => item.productId === productId && item.size === size
    );

    if (existingCartItem) {
      // If the product is already in the cart, update the quantity
      existingCartItem.quantity += parseInt(quantity);
      existingCartItem.price = parseInt(price); // Set the price
    } else {
      // If the product is not in the cart, create a new cart item
      const newCartItem = {
        productId,
        size,
        quantity: parseInt(quantity),
        price: parseInt(price),
      };

      cart.items.push(newCartItem);
      console.log("item added to " + req.user.name + "'s cart successfully: ")
    }

    // Update the total price
    cart.totalPrice += parseInt(price) * parseInt(quantity);

    // Save the cart to the database
    await cart.save();

    res.status(200).json({ message: "Added to cart successfully" });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Could not add item to cart" });
  }
});
// deleting from cart
app.use('/cart', cartRoutes);

app.get("*", (req, res) => {
  //display signup page
  res.render("404page", { isAuthenticated: req.isAuthenticated() });
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
