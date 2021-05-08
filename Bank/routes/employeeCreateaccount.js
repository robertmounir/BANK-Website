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
      return res.render('employeeCreateaccount', {
        title: "employeeCreateaccount",
        css: "employeeCreateaccount",
        href1: "employee",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " "+req.user.Mname + " " + req.user.Lname,
      });
    }
  else return res.redirect('./login');
  });
});

router.post('/', ensureAuthenticated, [
body('AID', "Account ID Is Missing").notEmpty(),
body('AID', "Account ID Must Be A Number").isNumeric(),
body('AID', "Account ID Can Not Be Less Than 3 Digits").isLength({min: 3}),
body('AID', "Account ID Can Not Be More Than 4 Digits").isLength({max: 4}),
body('CID', "Customer ID Is Missing").notEmpty(),
body('CID', "Customer ID Must Be A Number").isNumeric(),
body('Money', "You Deposite An Amount Of Money To Start Your Account").notEmpty(),
body('Money', "The Minimum Allowed Money Can Be Less Than A 1000").isLength({min: 3})
], (req,res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('employeeCreateaccount', {
      title: "employeeCreateaccount",
        css: "employeeCreateaccount",
        href1: "employee",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " "+req.user.Mname + " " + req.user.Lname,
        errors: errors
    });
  }
  var sqlquery = "select ID from account where ID = " + req.body.AID;
  db.query(sqlquery, (err, results, fields) => {
    if(err) return console.log(err);
    if(results[0]) {
      req.flash('danger', "Account ID Is Already Registered, Try Using Different ID");
      return res.redirect('/employeeCreateaccount');
    }
    else {
      sqlquery = "select ID from customer where ID = " + req.body.CID;
      db.query(sqlquery, (err, results, fields) => {
        if(err) return console.log(err);
        if(!results[0]) {
          req.flash('danger', "There Is No Customer With This ID");
          return res.redirect('/employeeCreateaccount');
        }
        else {
          sqlquery = "select bankID from branch where ID in (select Br_num from employee where ID = " + req.user.ID + ")"; 
          db.query(sqlquery,(err, results, fields) => {
            if(err) return console.log(err);
            let date_ob = new Date();
            let days = date_ob.getDate();
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();
            let min = date_ob.getMinutes();
            let hour = date_ob.getHours();
            let seconds = date_ob.getSeconds();
            let fulldate = year + "-" + month + "-" + days + " " + hour + ":" + min + ":" + seconds;
            sqlquery = "insert into account values (" + req.body.AID + ", " + req.body.CID + ", '" + fulldate + "', " + results[0].bankID + ", " + req.body.Money + ")";
            db.query(sqlquery, (err) => {
              if(err) return console.log(err);
              req.flash('success',"Successful operation");
              return res.redirect('/employeeCreateaccount');
            });
          });
        }
      }); 
    }
  });
});

module.exports = router;
