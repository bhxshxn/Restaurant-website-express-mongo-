const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const viewsPath = path.join(__dirname, './views');
const mongoose = require('mongoose');
const User = require('./models/user.js');
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");
const authenticateUser = require("./middlewares/authenticateUser");
const menu = require('./models/menu');
const order = require('./models/order');

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

// index route
app.get('/', (req, res) => {
    res.render('main/home', { user: req.session.user, page: "home" });
});

//post route home
app.get("/home", (req, res) => {
    res.render("main/home", { user: req.session.user, page: "home" });
});

// home route
app.get('/home', (req, res) => {
    res.render('main/home', { user: req.session.user, page: "home" });
});

// menu route
app.get('/menu', async (req, res) => {
    const Menu = await menu.find({})
    // console.log(Menu);
    res.render('main/menu', { m: Menu, user: req.session.user, page: "menu" });
});

// login route
app.get('/login', (req, res) => {
    res.render('main/login', { user: req.session.user, page: "login" });
});

// helpme route
app.get('/helpme', (req, res) => {
    res.render('main/helpme', { user: req.session.user, page: "helpme" });
});

// register route
app.get('/register', (req, res) => {
    res.render('main/register', { user: req.session.user, page: "login" });
});

//post for register
app.post("/register", async (req, res) => {
    const { email, password, username, add } = req.body;

    // check for missing filds
    if (!email || !password || !username || !add) {
        res.send("Please enter all the fields");
        return;
    }

    const doesUserExitsAlreay = await User.findOne({ email });

    if (doesUserExitsAlreay) {
        res.send("A user with that email already exits please try another one!");
        return;
    }

    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new User({ email, password: hashedPassword, username, add });

    latestUser
        .save()
        .then(() => {
            res.send("registered account!");
            return;
        })
        .catch((err) => console.log(err));
});

//post for login
app
    .post("/login", async (req, res) => {
        const { username, password } = req.body;

        // check for missing filds
        if (!username || !password) {
            res.send("Please enter all the fields");
            return;
        }

        const doesUserExits = await User.findOne({ username });

        if (!doesUserExits) {
            res.send("invalid username or password");
            return;
        }

        const doesPasswordMatch = await bcrypt.compare(
            password,
            doesUserExits.password
        );

        if (!doesPasswordMatch) {
            res.send("invalid useranme or password");
            return;
        }

        // else he\s logged in
        req.session.user = {
            username,
        };

        res.redirect("/home");
    })

//logout
app.get("/logout", authenticateUser, (req, res) => {
    req.session.user = null;
    res.redirect("/");
});

//output
app.get('/order', async (req, res) => {
    const Order = await order.find({})
    res.render('main/order', { user: req.session.user, orders: Order, page: null });
});

//order
app.get('/order-com/:id', async (req, res, next) => {
    var id = req.params.id;
    if (req.session.user) {
        // const product = {
        //     name: menu[id].title,
        //     quantity: 1,
        //     price: menu[id].price,
        //     user: req.session.user
        // };
        const result = await User.find({ _id: "5fe3416b8025362f44d4ec8a" });
        console.log(result);
        res.redirect('/menu');
    } else {
        res.send("Please Login First to Order");
    }
});



// Server
app.listen(port, () => {
    console.log(`Server is listening at port :${port}`)
});