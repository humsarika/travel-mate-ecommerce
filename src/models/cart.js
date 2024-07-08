const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model if you have user authentication
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Reference to the Product model
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        size: {
            type: String,
            required: true
            
        },
        price: {
            type: Number,
            required: true
           
        },
    },
],
    totalPrice: {
        type: Number,
        default: 0
    },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;