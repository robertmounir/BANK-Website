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
      const transactionquery = "select * from transactions where Sender_ID in (select ID from account where Cust = " + req.user.ID + ");";
      db.query(transactionquery, (err, results, fields) => {
        if (err) return console.log(err);
        history = results;
        db.query("select max(Amount) as max, min(Amount) as min, avg(Amount) as avg from transactions where Sender_ID in ( select ID from account where Cust = " + req.user.ID + ")", (err, results2, fields) => {
          if(err) return console.log(err);
          statistics = results2[0];
          return res.render('customerTransaction', {
            title: "customerTransaction",
            css: "customerTransaction",
            href1: "customer",
            button1: "Account",
            href2: "logout",
            button2: "Log Out",
            username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
            data: history,
            statistics: statistics
          });
        }); 
      });
    }
    else res.redirect('./login'); 
  });
});

router.post('/', ensureAuthenticated, [
  body('AID', 'SENDER ID Number Is MISSING').notEmpty(),
  body('AID',"ID Must be Number").isNumeric(),
  body('RID',"Reciver ID IS MISSING").notEmpty(),
  body('RID',"ID Must be Number").isNumeric(),
  body('Money', 'Quantity Is MISSING').notEmpty(),
  body('Money',"Quantity Must be Number").isNumeric()
], (req, res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('customerTransaction', {
      title: "customerTransaction",
      css: "customerTransaction",
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
  db.query(sqlquery, (err, results1, fields) => {
    if(err) return console.log(err);
    if(!results1[0]) {
      req.flash('danger', "You do NOT have an account with this ID");
      return res.redirect('/customerTransaction');
    }
    else {
      sqlquery = "select * from account where ID = " + req.body.RID;
      db.query(sqlquery, (err, results2, fields) => {
        if(err) return console.log(err);
        if(!results2[0]) {
          req.flash('danger', "There is NO account with this ID");
          return res.redirect('/customerTransaction');
        }
        else {
          if(results1[0].Amount < req.body.Money) {
            req.flash('danger', "No enough money");
            return res.redirect('/customerTransaction');
          }
          const sqlquery1 = "update account set Amount = Amount - " + req.body.Money + " where ID = " + req.body.AID;
          db.query(sqlquery1, (err1, rows1, fields) => {
            if(err1) console.log(err1);
            const amount = Number(results1[0].Amount) - Number(req.body.Money);
            req.flash('success',"Successful operation, your new balance is " + amount);
            return res.redirect('/customerTransaction');
          });
          const sqlquery2 = "update account set Amount = Amount + " + req.body.Money + " where ID = " + req.body.RID;
          db.query(sqlquery2, (err2) => {
            if(err2) console.log(err2);
          });
          const sqlquery3 = "insert into transactions (Sender_ID, Reciever_ID, Amount) values (" + req.body.AID + ", " + req.body.RID + ", " + req.body.Money + ");";
          db.query(sqlquery3, (err3) => {
            if(err3) return console.log(err3);
          });
        }
      });
    }
  });
});

module.exports = router;
