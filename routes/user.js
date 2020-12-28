const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const order = require('../models/order');
const menu = require('../models/menu');
const bcrypt = require('bcrypt');
const authenticateUser = require("../middlewares/authenticateUser");

// login route
router.get('/login', (req, res) => {
    res.render('main/login', { user: req.session.user, page: "login", msg: null });
});

// register route
router.get('/register', (req, res) => {
    res.render('main/register', { user: req.session.user, page: "login", msg: null });
});

//post for register
router.post("/register", async (req, res) => {
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
router
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
router.get("/logout", authenticateUser, (req, res) => {
    req.session.user = null;
    res.redirect("/");
});

//output
router.get('/order', async (req, res) => {
    const Order = await order.find({})
    res.render('main/order', { user: req.session.user, orders: Order, page: null, msg: null });
});

//order
router.get('/order-com/:id', async (req, res, next) => {
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

            new_order.save(async function (err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    const Menu = await menu.find({})
                    res.render('main/menu', { user: req.session.user, page: "menu", msg: "Order placed", m: Menu });
                }
            })
        };
    } else {
        const Menu = await menu.find({})
        res.render('main/menu', { user: req.session.user, page: "menu", msg: "Login to Order", m: Menu });
    }
});

//orders delete
router.get('/delete/:id', async (req, res) => {
    var id = req.params.id;
    await order.findByIdAndDelete({ _id: id });
    const Order = await order.find({})
    res.render('main/order', { user: req.session.user, orders: Order, page: null, msg: "Order Deleted" });
});



module.exports = router;