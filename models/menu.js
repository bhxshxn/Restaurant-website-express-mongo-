const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    Desc: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    imagePath: {
        type: String,
        required: true,
    },
});

module.exports = new mongoose.model("Menu", menuSchema);