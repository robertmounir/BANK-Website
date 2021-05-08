const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');
const { body, validationResult } = require('express-validator');
const bcrypt = require ('bcrypt');

router.get('/', ensureAuthenticated, (req,res) => {
  const sqlquery = "select * from employee where ID = " + req.user.ID + " and employee.ID not in (select Mgr from bank where Mgr = " + req.user.ID + ") and employee.ID not in (select Mgr from branch where Mgr = " + req.user.ID + ")";
  db.query(sqlquery, (err, results, fields) => {
    if(err) return console.log(err);
    if(results[0]){
      return res.render('employeechangepassword',{
        title: "Employee Change Password",
        css: "profile",
        href1: "employee",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
      });
    }
    else {
      return res.redirect('/login');
    }
  });
});

router.post('/', ensureAuthenticated, [
  body('PW', "Password Is Missing").notEmpty(),
  body('PW', "Password Can Not Be Less Than 2 Characters").isLength({min: 2}),
  body("PW", "Password Can Not Be More Than 25 Characters").isLength({max: 25}),
  body('CPW', "Confirm Password Is Missing").notEmpty(),
], async (req,res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('employeechangepassword', {
      title: "Employee Change Password",
      css: "profile",
      href1: "employee",
      button1: "Account",
      href2: "logout",
      button2: "Log Out",
      errors: errors
    });
  }
  if(req.body.PW != req.body.CPW) {
    req.flash('danger', "Password And Confirm Password Must Be Identical");
    return res.redirect('/employeechangepassword');
  }
  else {
    const hashedPassword = await bcrypt.hash(req.body.PW,3);
    const sqlquery = "update employee set password = '" + hashedPassword + "' where ID = " + req.user.ID;
    db.query(sqlquery, (err) => {
      if(err) return console.log(err);
      req.flash('success', 'Password Changed Successfully');
      return res.redirect('/employee');
    });
  }
});

module.exports = router;