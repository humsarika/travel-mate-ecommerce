const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/remove/:id', cartController.removeProduct);

module.exports = router;
