const express = require('express');
const router = express.Router();
const menu = require('../models/menu');
const helpme = require('../models/helpme.js');

// different routes
router.use('/user', require('../routes/user'));
router.use('/admin', require('../routes/admin'));

// index route
router.get('/', (req, res) => {
    res.render('main/home', { user: req.session.user, page: "home" });
});


//post route home
router.get("/home", (req, res) => {
    res.render("main/home", { user: req.session.user, page: "home" });
});

// home route
router.get('/home', (req, res) => {
    res.render('main/home', { user: req.session.user, page: "home" });
});

// menu route
router.get('/menu', async (req, res) => {
    const Menu = await menu.find({})
    // console.log(Menu);
    res.render('main/menu', { m: Menu, user: req.session.user, page: "menu", msg: null });
});



// helpme route
router.get('/helpme', (req, res) => {
    res.render('main/helpme', { user: req.session.user, page: "helpme", msg: null });
});

//helpme post
router.post('/helpme', async (req, res) => {
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


module.exports = router;