const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');
const { body, validationResult } = require('express-validator');
const bcrypt = require ('bcrypt');
var banks;
var creditcards;

router.get('/', ensureAuthenticated,(req, res) => {
  const sqlquery = "select * from customer where ID = " + req.user.ID;
  db.query(sqlquery, (err, results, fields) => {
    if (err) console.log(err);
    if (results[0]) {
      db.query("select bankName from bank", (err, rows, fields) => {
        banks = rows
        const creditcardquery = "select CC_ID, Create_date, bankName, cust_id, Amount, EXPIRE_DATE from credit_card join bank on bank_id = ID where cust_id = " + req.user.ID;
        db.query(creditcardquery, (err, results, fields) => {
          if(err) return console.log(err);
          creditcards = results;
          return res.render('customercreditcard', {
            title: "customercreditcard",
            css: "customercreditcard",
            href1: "customer",
            button1: "Account",
            href2: "logout",
            button2: "Log Out",
            username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
            data: rows,
            cards: creditcards
          });
        });
      });
    }
    else res.redirect('./login'); 
  });
});

router.post('/', ensureAuthenticated, [
  body('CCID', "credit Card ID must be a number").isNumeric(),
  body('CCID', "credit Card ID can NOT be less than 3 numbers").isLength({min: 3}),
  body('CCID', "credit Card ID can NOT be more than 4 numbers").isLength({max: 4}),
  body('password', 'Password Is MISSING').notEmpty(),
  body('password', 'Password Can NOT Be Less Than 3 Characters').isLength({ min: 3 }),
  body('bank', "Please choose a bank").notEmpty(),
], (req, res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('customercreditcard', {
      title: "customercreditcard",
      css: "customercreditcard",
      href1: "customer",
      button1: "Account",
      href2: "logout",
      button2: "Log Out",
      username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
      errors: errors,
      data: banks,
      cards: creditcards
    });
  }
  var sqlquery = "select cust_id from credit_card where CC_ID = " + req.body.CCID;
  db.query(sqlquery, (err,results1, fields) => {
    if(err) console.log(err);
    if(results1[0]) {
      req.flash('danger', "This ID is already registered");
      return res.redirect('/customercreditcard');
    }
    else {
      sqlquery = "select account.bank_id from account join bank on bank.ID = account.bank_id where Cust = " + req.user.ID + " and bank.bankName = '" + req.body.bank + "'";
      db.query(sqlquery, async(err, results, fields) => {
        if(err) return console.log(err);
        if(!results[0]) {
          req.flash('danger', "You do NOT have any account following bank " + req.body.bank + " linked to your ID");
          return res.redirect('/customercreditcard');
        }
        else {
          let date_ob = new Date();
          let days = date_ob.getDate();
          let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
          let year = date_ob.getFullYear();
          year = year + 1;
          let fulldate = year + "-" + month + "-" + days;
          const hashedpassword = await bcrypt.hash(req.body.password,3);
          const sqlquery2 = "insert into credit_card (CC_ID, pass_word, bank_id, cust_id, Amount, EXPIRE_DATE) values (" + req.body.CCID + ", '" + hashedpassword + "', " + results[0].bank_id + ", " + req.user.ID + ", " + 0 + ", '" + fulldate + "' );";
          db.query(sqlquery2, (error) => {
            if (error) return console.log(error);
            req.flash('success',"Successful operation");
            return res.redirect('/customercreditcard');
          });
        }
      });
    }
  });
});

module.exports = router;