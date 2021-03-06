var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var Order = require('../models/order');
var Cart = require('../models/cart');

var csrfProtection = csrf();
router.use(csrfProtection);

// ketika terima user/profile dari successRedirect
router.get('/profile', isLoggedIn,function(req, res, next){
  // untuk ambil data order berdasarkan user id
  Order.find({user: req.user}, function(err, orders){
    if(err){
      return res.write('Error!');
    }
    var cart;
    orders.forEach(function(order){
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render('user/profile', {orders: orders});
  });
});

router.get('/logout', isLoggedIn, function(req, res, next){
  req.logout();
  res.redirect('/');
});

// di atas ini fungsi yang tidak bisa dijalankan ketika belum login
// di bawah ini fungsi yang bisa dijalankan ketika belum login
router.use('/', notLoggedIn, function(req, res, next){
  next();
});

// ketika ingin masuk ke user/signup
router.get('/signup', function(req, res, next){
  var messages = req.flash('error');
  res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0})
});

// ketika button submit dari user/signup di klik, maka masuk ke sini
router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: '/user/signup',
  failureFlash: true
}), function(req, res, next){ 
  if (req.session.oldUrl){ // ketika belum login, tp mau checkout maka setelah signup akan diarahkan kembali ke menu checkout
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else { // untuk sign up biasa
    res.redirect('/user/profile');
  }
});

// ketika ingin masuk ke user/signin
router.get('/signin', function(req, res, next){
  var messages = req.flash('error');
  res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0})
});

router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: '/user/signin',
  failureFlash: true
}), function(req, res, next){ 
  if (req.session.oldUrl){ // ketika belum login, tp mau checkout maka setelah signup akan diarahkan kembali ke menu checkout
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else { // untuk login biasa
    res.redirect('/user/profile');
  }
});

module.exports = router;

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next){
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
