module.exports = (req, res, next) => {
    if (!req.session.user) {
        res.send("You're not allowed to view this content! please log in first as Admin!");
        return;
    }

    if (!(req.session.user.username === "Admin")) {
        res.send("You're not allowed to view this content! please log in first as Admin!");
        return;
    }
    //else continue
    next();
};

