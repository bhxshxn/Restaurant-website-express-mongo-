const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const viewsPath = path.join(__dirname, './views');
const mongoose = require('mongoose');
const cookieSession = require("cookie-session");


//session
app.use(
    cookieSession({
        keys: ["randomStringASyoulikehjudfsajk"],
    })
);

// view engine
app.set("view engine", "ejs");
app.set('views', viewsPath);
app.use(express.urlencoded({ extened: true }));
app.use(express.static('public'));
app.use('/', require('./routes/index.js'));

// mongo Connection
const url = "mongodb+srv://bhxshxn:bhxshxn@9@cluster0.ixoza.mongodb.net/RestaurantretryWrites=true&w=majority"
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,

})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Database is connected successfully on port 27017!!!');
});







// Server
app.listen(port, () => {
    console.log(`Server is listening at : http://localhost:${port}`);
});