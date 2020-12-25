const mongoose = require("mongoose");

const HelpmeSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
    },
    lname: {
        type: String,
        required: true,
    },
    phoneno: {
        type: Number,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    feedback: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: false,
    }
});

module.exports = new mongoose.model("Helpme", HelpmeSchema);