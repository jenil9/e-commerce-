const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String
  },
  image: {
    type: String
  },
  rating: {
    rate: {
      type: Number
    },
    count: {
      type: Number
    }
  }
}, { collection: 'Product' });
const product=mongoose.model('Product', productSchema);
module.exports = product;
