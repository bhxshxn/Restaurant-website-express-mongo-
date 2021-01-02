const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const cart = require('../models/cart');
const menu = require('../models/menu');
const bcrypt = require('bcrypt');
const authenticateUser = require("../middlewares/authenticateUser");
const paytm = require('../paytm/checksum/checksum');
const order = require('../models/order');
const user = require('../models/user.js');

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
    };
    var user = username.charAt(0).toUpperCase() + username.slice(1);

    const doesUserExitsAlreay = await User.findOne({ email });
    if (doesUserExitsAlreay) {
        res.render('main/register', { user: req.session.user, page: "login", msg: "Email already exists" });
        return;
    };

    const doesUsernameExitsAlreay = await User.findOne({ username: user });
    if (doesUsernameExitsAlreay) {
        res.render('main/register', { user: req.session.user, page: "login", msg: "Username already exists" });
        return;
    };

    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new User({ email, password: hashedPassword, username: user, add });

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
        var { username, password } = req.body;

        // check for missing filds
        if (!username || !password) {
            res.send("Please enter all the fields");
            return;
        }
        username = username.charAt(0).toUpperCase() + username.slice(1);
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
router.get('/order', authenticateUser, async (req, res) => {
    const Order = await order.find({})
    res.render('main/order', { user: req.session.user, orders: Order, page: null, msg: null });
});

//cart
router.get('/cart-com/:id', authenticateUser, async (req, res, next) => {
    var id = req.params.id;
    var id1;
    if (req.session.user) {
        const result = await menu.find({ _id: id });
        const carts = await cart.find({ user: req.session.user.username });
        var count = 0;
        carts.forEach(element => {
            if (result[0].title === element.name) {
                count++;
            };
        });
        if (count == 0) {
            if (result[0].id === id) {
                var new_cart = new cart({
                    name: result[0].title,
                    quantity: 1,
                    price: result[0].price,
                    user: req.session.user.username
                })

                new_cart.save(async function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        const Menu = await menu.find({})
                        res.render('main/menu', { user: req.session.user, page: "menu", msg: "Added to Cart", m: Menu });
                    }
                })
            };
        } else {
            const carts = await cart.find({ user: req.session.user.username });
            const result = await menu.find({ _id: id });
            // console.log(result[0].title);
            for (var i = 0; i < carts.length; i++) {
                if (result[0].title === carts[i].name) {
                    id1 = carts[i]._id;
                }
            }
            const results = await cart.findById({ _id: id1 });
            console.log(results);
            const Menu = await menu.find({ title: results.name })
            var quantitys = results.quantity;
            quantitys++;
            var prices = Menu[0].price * quantitys;
            console.log(Menu, quantitys, prices)
            await cart.replaceOne({ _id: id1 }, { name: Menu[0].title, user: req.session.user.username, quantity: quantitys, price: prices });
            res.redirect('back');
        }


    } else {
        const Menu = await menu.find({})
        res.render('main/menu', { user: req.session.user, page: "menu", msg: "Login to cart", m: Menu });
    }
});

//carts delete
router.get('/delete/:id', authenticateUser, async (req, res) => {
    var id = req.params.id;
    await cart.findByIdAndDelete({ _id: id });
    const carts = await cart.find({});
    res.render('main/cart', { user: req.session.user, cartes: carts, page: null, msg: "Item Removed" });
});

//carts route
router.get('/cart', authenticateUser, async (req, res) => {
    const carts = await cart.find({});
    res.render('main/cart', { user: req.session.user, cartes: carts, page: null, msg: null });
});

//carts add one
router.get('/add/:id', authenticateUser, async (req, res) => {
    var id = req.params.id;
    const result = await cart.findById({ _id: id });
    const Menu = await menu.find({ title: result.name })
    var quantitys = result.quantity;
    quantitys++;
    var prices = Menu[0].price * quantitys;
    await cart.replaceOne({ _id: id }, { name: Menu[0].title, user: req.session.user.username, quantity: quantitys, price: prices });
    res.redirect('back');
});

//carts minus one
router.get('/minus/:id', authenticateUser, async (req, res) => {
    var id = req.params.id;
    const result = await cart.findById({ _id: id });
    const Menu = await menu.find({ title: result.name })
    var quantitys = result.quantity;
    quantitys--;
    if (quantitys === 0) {
        await cart.findByIdAndDelete({ _id: id });
        res.redirect('back');
    } else {
        var prices = Menu[0].price * quantitys;
        await cart.replaceOne({ _id: id }, { name: Menu[0].title, user: req.session.user.username, quantity: quantitys, price: prices });
        res.redirect('back');
    };
});

//menu search
router.post('/search', authenticateUser, async (req, res) => {
    var name = req.body.search;
    name = name.charAt(0).toUpperCase() + name.slice(1);
    const Menu = await menu.find({ title: name });
    if (Menu.length > 0) {
        res.render('main/menu', { m: Menu, page: 'menu', msg: null, user: req.session.user });
    } else {
        const Menus = await menu.find({});
        res.render('main/menu', { m: Menus, page: 'menu', msg: 'No such Dish found', user: req.session.user });
    }
});

//checkout
router.get('/checkout', authenticateUser, async (req, res) => {
    const result = await cart.find({ user: req.session.user.username });
    // const user = await User.find({ username: req.session.user.username });
    // // console.log(result);
    var amount = 0;
    var detail = "";
    result.forEach(element => {
        amount += parseInt(element.price);
        detail += `${element.name} (x${element.quantity}), `
    });
    // // console.log(amount);
    // // console.log(detail);
    var PaytmConfig = {
        mid: "szNRBn33208468734488",
        key: "X&jBXkX#x&_yU@nl",
        website: "WEBSTAGING"
    };
    var params = {};
    params['MID'] = PaytmConfig.mid;
    params['WEBSITE'] = PaytmConfig.website;
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = 'TEST_' + new Date().getTime();
    params['CUST_ID'] = 'Customer001';
    params['TXN_AMOUNT'] = `${parseInt(amount)}`;
    params['CALLBACK_URL'] = `http://localhost:3000/user/order/${req.session.user.username}`;
    params['EMAIL'] = 'abc@mailinator.com';
    params['MOBILE_NO'] = '7777777777';

    paytm.genchecksum(params, PaytmConfig.key, (err, checksum) => {
        let txn_url = "https://securegw-stage.paytm.in/order/process";

        var form_fields = "";
        for (var x in params) {
            form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
        }
        form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
        res.end();
    });

});


//post checkout
router.post('/order/:id', async (req, res) => {
    const id = req.params.id;
    const Order = new order({
        orderId: req.body.ORDERID, tranId: req.body.TXNID, amount: req.body.TXNAMOUNT, user: id
    });
    Order.save()
        .then(async () => {
            await cart.deleteMany({ user: id });
            res.redirect('/user/order');
            return;
        })
        .catch((err) => console.log(err));

});


module.exports = router;