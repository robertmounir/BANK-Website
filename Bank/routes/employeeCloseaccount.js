const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');
const { body, validationResult } = require('express-validator');

router.get('/', ensureAuthenticated, (req, res) =>{
  const sqlquery = "select * from employee where ID = " + req.user.ID + " and employee.ID not in (select Mgr from bank where Mgr = " + req.user.ID + ") and employee.ID not in (select Mgr from branch where Mgr = " + req.user.ID + ")";
  db.query(sqlquery, (err, results, fields) => {
    if(err) 
    return console.log(err);
    if(results[0]){
        return res.render('employeeCloseaccount', {
        title: "employeeCloseaccount",
        css: "employeeCloseaccount",
        href1: "employee",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " "+req.user.Mname + " " + req.user.Lname,
        bio: ""
      });
    }
    else return res.redirect('./login');
  });
});

router.post('/', ensureAuthenticated, [
  body('AID', "Account ID Is Missing").notEmpty(),
  body('AID', "Account ID Must Be A Number").isNumeric(),
  body('CID', "Customer ID Is Missing").notEmpty(),
  body('CID', "Customer ID Must Be A Number").isNumeric()
  ], (req,res) => {
    const errors = validationResult(req).errors;
    if(errors.length) {
      return res.render('employeeCloseaccount', {
        title: "employeeCloseaccount",
        css: "employeeCloseaccount",
        href1: "employee",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " " +req.user.Mname + " " + req.user.Lname,
        errors: errors
      });
    }
    var sqlquery = "select account.ID from account join bank on bank.ID = account.bank_id where account.ID = " + req.body.AID + " and bank.ID in (select bankID from branch where ID = " + req.user.Br_num + ")"       
    db.query(sqlquery, (err, results, fields) => {
      if(err) return console.log(err);
      if(!results[0]) {
        req.flash('danger', "No Account With ID " + req.body.AID + " Was Found");
        return res.redirect('/employeeCloseaccount');
      }
      else {
        sqlquery = "select ID from customer where ID = " + req.body.CID;
        db.query(sqlquery, (err, results, fields) => {
          if(err) return console.log(err);
          if(!results[0]) {
            req.flash('danger', "There Is No Customer With This ID " + req.body.CID);
            return res.redirect('/employeeCloseaccount');
          }
          else {
            sqlquery = "select Amount from loan where cust_id = " + req.body.CID + " and bank_id in (select bankID from branch where ID = " + req.user.Br_num + ")";
            db.query(sqlquery, (err, results, fields) => {
              if (err) return console.log(err);
              if(results[0]) {
                req.flash("danger", "Customer With ID " + req.body.CID + " Has Requested Loans And Did Not Pay Them Back");
                res.redirect('/employeeCloseaccount')
              }
              else {
                sqlquery = "delete from account where ID = " + req.body.AID; 
                db.query(sqlquery, (err) => {
                  if(err) return console.log(err);
                  req.flash('success',"Successful operation");
                  return res.redirect('/employeeCloseaccount');  
                });
              }
            });  
          }
        }); 
      }
    });
});

module.exports = router;
