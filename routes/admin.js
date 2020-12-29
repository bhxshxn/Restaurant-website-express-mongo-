const express = require('express');
const router = express.Router();
const multer = require('multer');
const menu = require('../models/menu');
const order = require('../models/order');
const isAdmin = require('../middlewares/isAdmin')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/')
    },
    filename: (req, file, cb) => {
        cb(null, `${+Date.now()}-${file.originalname}`)
    }, fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png') {
            cb(null, true);
        }
        else {
            cb(new multer.MulterError('not a PNG'));
        }
    }
})
const upload = multer({ storage });

// index get
router.get('/', isAdmin, (req, res) => {
    res.render('admin/index');
});

//upload item get
router.get('/upload', isAdmin, (req, res) => {
    res.render('admin/uploaditem', { msg: null });
});

//post upload
router.post('/upload', isAdmin, upload.single('image'), (req, res) => {
    // const { title, price, Desc } = req.body
    const new_item = new menu({
        title: req.body.title,
        Desc: req.body.Desc,
        price: req.body.price,
        imagePath: `/images/${req.file.filename}`,
    });
    new_item.save(async function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            res.render('admin/uploaditem', { msg: "Item Uploaded", });
        }
    })
});

//orders route
router.get('/order', isAdmin, async (req, res) => {
    const result = await order.find({});
    res.render('admin/order', { orders: result });
});

module.exports = router;