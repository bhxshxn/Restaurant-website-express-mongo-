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
const helpme = require('./models/helpme.js');

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
    res.render('main/login', { user: req.session.user, page: "login", msg: null });
});

// helpme route
app.get('/helpme', (req, res) => {
    res.render('main/helpme', { user: req.session.user, page: "helpme", msg: null });
});

//helpme post
app.post('/helpme', async (req, res) => {
    const { fname, lname, phoneno, country, feedback } = req.body;
    if (req.session.user) {
        const user = req.session.user.username;
    };
    const latestFeedback = new helpme({ fname, lname, phoneno, country, feedback });
    latestFeedback
        .save()
        .then(() => {
            const message = "Thank you we will look after the issues.";
            res.render('main/helpme', { user: req.session.user, page: "helpme", msg: message });


            return;
        })
        .catch((err) => console.log(err));

});

// register route
app.get('/register', (req, res) => {
    res.render('main/register', { user: req.session.user, page: "login", msg: null });
});

//post for register
app.post("/register", async (req, res) => {
    const { email, password, username, add } = req.body;

    // check for missing filds
    if (!email || !password || !username || !add) {
        res.render('main/register', { user: req.session.user, page: "login", msg: "Please enter all the fields" })
        return;
    }

    const doesUserExitsAlreay = await User.findOne({ email });

    if (doesUserExitsAlreay) {
        res.render('main/register', { user: req.session.user, page: "login", msg: "Email already exists" });
        return;
    }

    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new User({ email, password: hashedPassword, username, add });

    latestUser
        .save()
        .then(() => {
            res.render('main/register', { user: req.session.user, page: "login", msg: "Registered Succesfully! Login." });
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
            res.render('main/login', { user: req.session.user, page: "login", msg: "Invalid useranme or password" }); return;
        }

        const doesPasswordMatch = await bcrypt.compare(
            password,
            doesUserExits.password
        );

        if (!doesPasswordMatch) {
            res.render('main/login', { user: req.session.user, page: "login", msg: "Invalid useranme or password" });
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
    res.render('main/order', { user: req.session.user, orders: Order, page: null, count: null });
});

//order
app.get('/order-com/:id', async (req, res, next) => {
    var id = req.params.id;
    if (req.session.user) {
        const result = await menu.find({ _id: id });
        if (result[0].id === id) {
            var new_order = new order({
                name: result[0].title,
                quantity: 1,
                price: result[0].price,
                user: req.session.user.username
            })

            new_order.save(function (err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(result)
                }
            })
        };
        res.redirect('/menu');
    } else {
        res.send("Please Login First to Order");
    }
});



// Server
app.listen(port, () => {
    console.log(`Server is listening at : http://localhost:${port}`);
});