const router = require('express').Router();
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const db = require('./connection');

let type = '/customer'
router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    const sqlquery = "select * from Customer where ID = " + req.user.ID;
    db.query(sqlquery, (err, results, fields) => {
      if (err) return console.log(err);
      if (results[0]) {
        type = '/customer';
        res.redirect('/customer');
      }
      else {
        const sqlquery2 = "select * from Branch where Branch.Mgr = " + req.user.ID;
        db.query(sqlquery2, (err, results, fields) => {
          if (err) return console.log(err);
          if (results[0]) {
            type = '/manager';
            res.redirect('./manager');
          }
          else {
            const sqlquery3 = "select * from bank where bank.Mgr = " + req.user.ID;
            db.query(sqlquery3, (err, results, fields) => {
              if (err) return console.log(err);
              if (results[0]) {
                type = '/bankmgr';
                res.redirect('./bankmgr');
              }else
              {
                type = '/employee';
                res.redirect('./employee');
              }
          });
          }
        });
      }
    });

  }
  else {
    res.render('login', {
      title: "Log In",
      css: "login",
      href1: "register",
      button1: "Sign Up",
      href2: "login",
      button2: "Log In",
    });
  }
});

router.post('/', [
  body('username', 'ID Is MISSING').notEmpty(),
  body('username', 'ID Must Be A NUMBER Only').isNumeric(),
  body('password', 'Password Is MISSING').notEmpty(),
], (req, res, next) => {
  const errors = validationResult(req).errors;
  if (errors.length) {
    return res.render('login', {
      title: "Log In",
      css: "login",
      href1: "register",
      button1: "Register",
      href2: "login",
      button2: "Log In",
      errors: errors
    });
  }
  passport.authenticate('local', {
    successRedirect: type,
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

module.exports = router;