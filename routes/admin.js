const express = require('express');
const router = express.Router();
const multer = require('multer');
const menu = require('../models/menu');
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
router.get('/', (req, res) => {
    res.render('admin/index');
});

//upload item get
router.get('/upload', (req, res) => {
    res.render('admin/uploaditem', { msg: null });
});

//post upload
router.post('/upload', upload.single('image'), (req, res) => {
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
            const Menu = await menu.find({})
            res.render('admin/uploaditem', { msg: "Item Uploaded", });
        }
    })
});

module.exports = router;