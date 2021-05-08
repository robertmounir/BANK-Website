const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');
const { body, validationResult } = require('express-validator');

var banks ;
var loan;
var statistics;
router.get('/', ensureAuthenticated, (req, res) => {
  var sqlquery = "select * from customer where ID = " + req.user.ID;
  db.query(sqlquery, (err, results, fields) => {
    if (err) console.log(err);
    if (results[0]) {
      db.query("select bankName from bank", (err, rows, fields) => {
        if(err) return console.log(err)
        banks = rows
        const loanquery = "select bankName, cust_id, Amount, Create_date from loan join bank on ID = bank_id where cust_id = " + req.user.ID;
        db.query(loanquery, (err, results, fields) => {
          if(err) return console.log(err);
          loan = results;
          db.query("select max(Amount) as max, min(Amount) as min, avg(Amount) as avg from loan where cust_id = " + req.user.ID, (err, results2, fields) => {
            if(err) return console.log(err);
            statistics = results2[0];
            return res.render('customerloan', {
              title: "customerloan",
              css: "customerloan",
              href1: "customer",
              button1: "Account",
              href2: "logout",
              button2: "Log Out",
              username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
              data: rows,
              loans: results,
              statistics: results2[0]
            });
          });
        });
      });
    }
    else res.redirect('./login'); 
  });
});

router.post('/', ensureAuthenticated, [
  body('bank', "Please choose a bank").notEmpty(),
  body('Money', 'Quantity Is MISSING').notEmpty(),
  body('Money',"Quantity Must be Number").isNumeric()
], (req, res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('customerloan', {
      title: "customerloan",
      css: "customerloan",
      href1: "customer",
      button1: "Account",
      href2: "logout",
      button2: "Log Out",
      username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
      errors: errors,
      data: banks,
      loans: loan,
      statistics: statistics
    });
  }
  var sqlquery = "select account.bank_id from account join bank on bank.ID = account.bank_id where Cust = " + req.user.ID + " and bank.bankName = '" + req.body.bank + "'";
  db.query(sqlquery, (err, results, fields) => {
    if(err) return console.log(err);
    if(!results[0]) {
      req.flash('danger', "You do NOT have any account following bank " + req.body.bank + " linked to your ID");
      return res.redirect('/customerloan');
    }
    else {
      const sqlquery2 = "insert into loan (cust_ID, bank_id, Amount) values (" + req.user.ID + ", " + results[0].bank_id + ", " + req.body.Money + ");";
      db.query(sqlquery2, (error, rows, fields) => {
        if (error) console.log(error);
        req.flash('success',"Successful operation");
        return res.redirect('/customerloan');
      });
    }
  });
});

module.exports = router;
