
const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');
const { body, validationResult } = require('express-validator');
const bcrypt = require ('bcrypt');

router.get('/', ensureAuthenticated, (req, res) => {
  const sqlquery = "select * from employee where ID = " + req.user.ID + " and  employee.ID in (select Mgr from branch where Mgr = " + req.user.ID + ")";
  db.query(sqlquery, (err, results, fields) => {
    if(err) return console.log(err);
    console.log(results);
    if(results[0]) {
      res.render('managerremoveemployee', {
        title: "Manager Remove Employee",
        css: "managerremoveemployee",
        href1: "manager",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " " +req.user.Mname + " " + req.user.Lname,
        bio: ""
      });
    }
    else {
      return res.redirect('./login');
    }
  })
});

router.post('/', ensureAuthenticated, [
  body('RID', 'ID Number Is MISSING').notEmpty(),
  body('RID',"ID Must be Number").isNumeric()
], (req,res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('managerremoveemployee', {
        title: "Manager Remove Employee",
        css: "managerremoveemployee",
        href1: "manager",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " " +req.user.Mname + " " + req.user.Lname,
        bio: "",
        errors: errors
    });
  }

  const id = req.body.RID;
  var sqlquery = "select employee.ID from employee join branch on Br_num = branch.ID join bank on bank.ID = branch.bankID where employee.ID = " + Number(id) + " and branch.Mgr = " + req.user.ID + " and bank.Mgr != " + id;
  db.query(sqlquery, async(err, results, fields)=> {
    if(err) return console.log(err);
    if(results.length == 0) {
      req.flash('danger', 'There is no Employee with this ID');
      return res.redirect('/managerremoveemployee');
    }
    else {
      if(req.user.ID == req.body.RID) {
        req.flash('danger', 'You Can Not Remove Your Self!');
        return res.redirect('/managerremoveemployee');
      }
      sqlquery = "Delete from employee where ID =" + Number(id) ;
      db.query(sqlquery, (err, results, fields) => {
        if(err)
         return console.log(err);
        console.log(results);
        req.flash('success',"Deleted ")
        return res.redirect('/managerremoveemployee');
      });
    }
  });
});

module.exports = router;