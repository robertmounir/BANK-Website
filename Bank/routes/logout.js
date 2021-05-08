const router = require('express').Router();
const passport = require('passport');
const { ensureAuthenticated } = require('../passport-config/auth');
const bcrypt = require('bcrypt');
const db = require('./connection');

router.get('/', ensureAuthenticated, (req, res) => {
  req.flash('success', 'You Are Logged Out');
  req.logOut();
  return res.redirect('/login');
});

module.exports = router;