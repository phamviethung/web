// app/routes.js
var client = require('C:/Users/hungpv/WebstormProjects/recommender/config/elasticsearch');
module.exports = function (app, passport) {
   //var client = require('C:/Users/hungpv/WebstormProjects/recommender/config/elasticsearch');

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================

    /*
     app.get('/login', function (req, res) {
     res.render('index.ejs'); // load the index.ejs file
     });
     */
    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    /*
     app.get('/hello', function(req, res) {
     res.render('search', {});
     console.log(req.user.local.email);
     });
     */

    app.get('/', function (req, res) {
        res.render('search', {});
    });

    app.get('/home', function (req, res) {
        var user = req.user.local.email;
        console.log(user);
        res.render('search1', {msg: user});
    });

    app.get('/search', function (req, res) {
        title = req.param('title');
        client.search({
            index: 'bigmovie',
            size: 50,
            body: {
                query: {
                    match: {
                        title: title
                    }
                }
            }
        }).then(function (body) {
            var hits = body.hits.hits;
            if (req.user) {
                // logged in
                var user = req.user.local.email;
                res.render('info1', {msg: hits, msg1: user});
            } else {
                // not logged in
                res.render('info', {msg: hits});
            }

        }, function (error) {
            console.trace(error.message);
        });
    });

    var hits = '';
    var hits1 = '';
    app.get('/detail', function (req, res) {
        id = req.param('id');
        client.search({
            index: 'bigmovie',
            body: {
                query: {
                    match: {
                        _id: id
                    }
                }
            }
        }).then(function (body) {
            hits = body.hits.hits;
            if (req.user) {
                // logged in
                var user = req.user.local.email;
                console.log("user = " + user);
                client.search({
                    index: 'recommendation',
                    body: {
                        query: {
                            match: {
                                _id: user
                            }
                        }
                    }
                }).then(function (body) {
                    hits1 = body.hits.hits;
                    res.render('detail1', {msg0: hits, msg1: hits1, msg2: user});
                }, function (error) {
                    console.trace(error.message);
                });

            } else {
                // not logged in
                res.render('detail', {msg0: hits});
            }
        }, function (error) {
            console.trace(error.message);
        });


    });

    app.get('/recommend', function (req, res) {
        title = req.param('title');
        console.log(title);
        client.search({
            size: 1,
            body: {
                query: {
                    match: {
                        title: title
                    }
                }
            }
        }).then(function (body) {
            hits = body.hits.hits;
            if (req.user) {
                // logged in
                var user = req.user.local.email;

                res.render('detail1', {msg0: hits, msg1: hits1, msg2: user});
            } else {
                res.render('detail', {msg0: hits, msg1: hits1});
            }

        }, function (error) {
            console.trace(error.message);
        });
    });


    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        items = '';
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}