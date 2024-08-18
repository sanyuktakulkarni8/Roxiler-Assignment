const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sold: Boolean,
    dateOfSale: { type: String, required: true },
});

module.exports = mongoose.model('Transaction', TransactionSchema);