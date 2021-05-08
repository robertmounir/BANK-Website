const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

var branchs;
router.get('/', ensureAuthenticated, (req, res) => {
  const sqlquery = "select * from  Bank where Bank.Mgr = " + req.user.ID ;
  db.query(sqlquery, (err, results, fields) => {
    if (err) return console.log(err);
    if (results[0]) {
      db.query("select ID from branch where bankID = " + results[0].ID, (err, results2, fields) => {
        if(err) return console.log(err);
        branchs = results2;
        res.render('bankmgrAddmanager', {
          title: "Manager Add Employee",
          css: "bankmgrAddmanager",
          href1: "bankmgr",
          button1: "Account",
          href2: "logout",
          button2: "Log Out",
          username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
          data: results2
        });
      });
    }
    else {
      return res.redirect('./login');
    }
  })
});

router.post('/', ensureAuthenticated, [
  body("EID", "Employee ID Is Missing").notEmpty(),
  body("EID", "Employee ID Must Be A Number").isNumeric(),
  body("branch", "Please Choose A Branch").notEmpty(),
], (req, res) => {
  const errors = validationResult(req).errors;
  if (errors.length) {
    return res.render('bankmgrAddmanager', {
      title: "Manager Add Employee",
      css: "bankmgrAddmanager",
      href1: "bankmgr",
      button1: "Account",
      href2: "logout",
      button2: "Log Out",
      username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
      data: branchs,
      errors: errors
    });
  }
  const sqlquery = "select employee.ID from employee join branch on employee.Br_num = branch.ID join bank on bank.ID = branch.bankID where bank.Mgr = " + req.user.ID + " and employee.ID != " + req.user.ID + " and employee.ID = " + req.body.EID;
  db.query(sqlquery, (err, results, fields) => {
    if (err) return console.log(err);
    if(!results[0]){
      req.flash('danger', "Employee Not Found");
      return res.redirect('/bankmgrAddmanager');
    }
    const updatequery = "update branch set Mgr = " + req.body.EID + " where ID = " + req.body.branch;
    db.query(updatequery, (err) => {
      if(err) return console.log(err);
      db.query("update employee set Br_num = " + req.body.branch + " where ID = " + req.body.EID, (err) => {
        if(err) return console.log(err);
      });
      req.flash('success', "Successful Operation");
      return res.redirect('/bankmgrAddmanager');
    });
  });
});

module.exports = router;