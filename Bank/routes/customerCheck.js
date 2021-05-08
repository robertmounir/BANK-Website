const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');

router.get('/', ensureAuthenticated,(req, res) => {
  var sqlquery = "select * from customer where ID = " + req.user.ID;
  db.query(sqlquery, (err, results, fields) => {
    if (err) console.log(err);
    if (results[0]) {
      sqlquery = "select account.ID, Cust, Amount, create_date, bankName from account join bank on bank_id = bank.ID where Cust = " + req.user.ID;
      db.query(sqlquery, (err, results, fields) => {
        if(err) return console.log(err);
        return res.render('customerCheck', {
          title: "customerCheck",
          css: "customerCheck",
          href1: "customer",
          button1: "Account",
          href2: "logout",
          button2: "Log Out",
          username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
          data: results
        });
      });
    }
    else res.redirect('./login'); 
  });
});

module.exports = router;