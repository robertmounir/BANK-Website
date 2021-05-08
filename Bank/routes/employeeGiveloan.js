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
      return res.render('employeeGiveloan', {
        title: "employeeGiveloan",
        css: "employeeGiveloan",
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
  body('CID', "Customer ID Is Missing").notEmpty(),
  body('CID', "Customer ID Must Be A number").isNumeric(),
  body('Money', 'Money Is Missing').notEmpty(),
  body('Money',"Money Must be Number").isNumeric()
], (req, res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('employeeGiveloan', {
      title: "employeeGiveloan",
      css: "employeeGiveloan",
      href1: "employee",
      button1: "Account",
      href2: "logout",
      button2: "Log Out",
      username: req.user.Fname + " "+req.user.Mname + " " + req.user.Lname,
      errors: errors,
    });
  }
  var sqlquery = "select account.bank_id from account join bank on bank.ID = account.bank_id where Cust = " + req.body.CID + " and bank.ID in (select bankID from branch where ID = " + req.user.Br_num + ")";
  db.query(sqlquery, (err, results, fields) => {
    if(err) return console.log(err);
    if(!results[0]) {
      req.flash('danger', "Not Account Was found Liked To This User ID");
      return res.redirect('/employeeGiveloan');
    }
    else {
      const sqlquery2 = "insert into loan (cust_ID, bank_id, Amount) values (" + req.body.CID + ", " + results[0].bank_id + ", " + req.body.Money + ");";
      db.query(sqlquery2, (error, rows, fields) => {
        if (error) console.log(error);
        req.flash('success',"Successful operation");
        return res.redirect('/employeeGiveloan');
      });
    }
  });
});

module.exports = router;
