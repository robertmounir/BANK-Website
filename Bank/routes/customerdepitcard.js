const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require ('bcrypt');
const db = require('./connection');
var banks;
var debitcards;

router.get('/', ensureAuthenticated, (req, res) => {
  const sqlquery = "select * from customer where ID = " + req.user.ID;
  db.query(sqlquery, (err, results, fields) => {
    if (err) console.log(err);
    if (results[0]) {
      db.query("select bankName from bank", (err, rows, fields) => {
        if(err) return console.log(err);
        banks = rows;
        const debitcardquery = "select DC_ID, Create_date, acc_id, bankName from debit_card join bank on bank_id = ID where acc_id in (select ID from account where Cust = " + req.user.ID + ");";
        db.query(debitcardquery, (err, results, fields) => {
          if(err) return console.log(err);
          debitcards = results;
          return res.render('customerdepitcard', {
            title: "customerdepitcard",
            css: "customerdepitcard",
            href1: "customer",
            button1: "Account",
            href2: "logout",
            button2: "Log Out",
            username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
            data: rows,
            cards: debitcards
          });
        }); 
      });
    }
    else res.redirect('./login'); 
  });
});

router.post('/', ensureAuthenticated, [
  body('DCID', 'Debit card ID Is MISSING').notEmpty(),
  body('DCID', 'Debit Card ID Must Be A NUMBER').isNumeric(),
  body('DCID', "Debit Card ID Can NOT Be Less Than 3 Numbers").isLength({min: 3}),
  body('DCID', "Debit Card ID Can NOT Be More Than 4 Numbers").isLength({max: 4}),
  body('AID', 'ID Number Is MISSING').notEmpty(),
  body('AID',"ID Must be Number").isNumeric(),
  body('password', 'Password Is MISSING').notEmpty(),
  body('password', 'Password Can NOT Be Less Than 3 Characters').isLength({ min: 3 }),
  body('password', 'Password Can NOT Be More Than 5 Characters').isLength({ max: 5 }),
], (req, res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('customerdepitcard', {
      title: "customerdepitcard",
      css: "customerdepitcard",
      href1: "customer",
      button1: "Account",
      href2: "logout",
      button2: "Log Out",
      username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
      errors: errors,
      data: banks,
      cards: debitcards
    });
  }
  var sqlquery = "select acc_id from debit_card where DC_ID = " + req.body.DCID;
  db.query(sqlquery, (err,results1, fields) => {
    if(err) console.log(err);
    if(results1[0]) {
      req.flash('danger', "This ID is already registered");
      return res.redirect('/customerdepitcard');
    }
    else {
      sqlquery = "select account.bank_id from account join bank on bank.ID = account.bank_id where Cust = " + req.user.ID + " and bank.bankName = '" + req.body.bank + "'" + " and account.ID = " + req.body.AID;
      db.query(sqlquery, async(err, results, fields) => {
        if(err) return console.log(err);
        if(!results[0]) {
          req.flash('danger', "You do NOT have any account following bank " + req.body.bank + " linked to your ID");
          return res.redirect('/customerdepitcard');
        }
        else {
          const hashedpassword = await bcrypt.hash(req.body.password,3);
          const sqlquery2 = "insert into debit_card (DC_ID, pass_word, bank_id, acc_id) values (" + req.body.DCID + ", '" + hashedpassword + "', " + results[0].bank_id + ", " + req.body.AID + ");";
          db.query(sqlquery2, (error) => {
            if (error) return console.log(error);
            req.flash('success',"Successful operation");
            return res.redirect('/customerdepitcard');
          });
        }
      });
    }
  });
});

module.exports = router;
