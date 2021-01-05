const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
    },
    tranId: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    }
});

module.exports = new mongoose.model("Order", orderSchema);