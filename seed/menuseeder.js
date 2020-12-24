const Product = require('../models/menu');
const mongoose = require('mongoose');

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

const product = [
    new Product({
        imagePath: "/images/pizza.jpg",
        title: 'Pizza',
        Desc: 'Good shoes',
        price: 30
    }),
    new Product({
        imagePath: "/images/ff.jpg",
        title: 'French Fries',
        Desc: 'Good shoes',
        price: 10
    }),
    new Product({
        imagePath: "/images/noodles.jpg",
        title: 'Noodles',
        Desc: 'Good shoes',
        price: 50
    }),
    new Product({
        imagePath: "/images/burger.jpg",
        title: 'Burger',
        Desc: 'Good shoes',
        price: 40
    }),
    new Product({
        imagePath: "/images/cake.jpg",
        title: 'Cake',
        Desc: 'Good shoes',
        price: 20
    })
];

var done = 0;
for (var i = 0; i < product.length; i++) {
    product[i].save((err, result) => {
        done++;
        if (done == product.length) {
            exit();
        }
    })
};
function exit() {
    mongoose.disconnect();
    console.log('done');
}