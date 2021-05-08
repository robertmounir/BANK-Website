const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');
const { body, validationResult } = require('express-validator');
var history;
var statistics;

router.get('/', ensureAuthenticated, (req, res) => {
  const sqlquery = "select * from customer where ID = " + req.user.ID;
  db.query(sqlquery, (err, results, fields) => {
    if (err) console.log(err);
    if (results[0]) {
      db.query("select * from withdraws where Cust_ID = " + req.user.ID, (err, results, fields) => {
        if(err) return console.log(err);
        history = results;
        db.query("select max(Amount) as max, min(Amount) as min, avg(Amount) as avg from withdraws where Cust_ID = " + req.user.ID, (err, results2, fields) => {
          if(err) return console.log(err);
          statistics = results2[0];
          return res.render('customerWithdraw', {
            title: "customerWithdraw",
            css: "customerWithdraw",
            href1: "customer",
            button1: "Account",
            href2: "logout",
            button2: "Log Out",
            username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
            data: results,
            statistics: statistics
          });
        });
      });
    }
    else res.redirect('./login'); 
  });
});

router.post('/', ensureAuthenticated, [
  body('AID', 'ID Number Is MISSING').notEmpty(),
  body('AID',"ID Must be Number").isNumeric(),
  body('Money', 'Quantity Is MISSING').notEmpty(),
  body('Money',"Quantity Must be Number").isNumeric()
], (req, res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('customerWithdraw', {
      title: "customerWithdraw",
      css: "customerWithdraw",
      href1: "customer",
      button1: "Account",
      href2: "logout",
      button2: "Log Out",
      username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
      data: history,
      statistics: statistics,
      errors: errors
    });
  }
  var sqlquery = "select * from account where ID = " + req.body.AID + " and Cust = " + req.user.ID;
  db.query(sqlquery, (err, results, fields) => {
    if(err) return console.log(err);
    if(!results[0]) {
      req.flash('danger', "You do NOT have an account with this ID");
      return res.redirect('/customerWithdraw');
    }
    else {
      if(results[0].Amount < req.body.Money) {
        req.flash('danger', "No enough money");
        return res.redirect('/customerWithdraw');
      }
      sqlquery = "update account set Amount = Amount - " + req.body.Money + " where ID = " + req.body.AID;
      db.query(sqlquery, (err, rows, fields) => {
        if(err) return console.log(err);
        const amount = Number(results[0].Amount) - Number(req.body.Money);
        req.flash('success',"Successful operation, your new balance is " + amount);
        return res.redirect('/customerWithdraw');
      });
      const sqlquery2 = "insert into withdraws (ACC_ID, Cust_ID, Amount) values (" + req.body.AID + ", " + req.user.ID + ", " + req.body.Money + ");";
      db.query(sqlquery2, (error, rows, fields) => {
        if (error) console.log(error);
      });
    }
  });
});

module.exports = router;