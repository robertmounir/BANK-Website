
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
      res.render('managerraise', {
        title: "assign a pay rise ",
        css: "managerraise",
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
  body('EID', 'ID Number Is MISSING').notEmpty(),
  body('EID',"ID Must be Number").isNumeric(),
  body('Money', 'Quantity Is MISSING').notEmpty(),
  body('Money',"Quantity Must be Number").isNumeric()
], (req,res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('managerraise', {
        title: "assign a pay rise ",
        css: "managerraise",
        href1: "manager",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " " +req.user.Mname + " " + req.user.Lname,
        bio: "",
        errors: errors
      });
  }

  const id = req.body.EID;
  const Mnum = req.body.Money;
  var sqlquery = "select salary from employee where ID = " + Number(id);
  db.query(sqlquery, async(err, results, fields)=> {
    if(results.length == 0) {
      if(err){
       return console.log(err);
      }
      
      req.flash('danger', 'There is no Employee with this ID');
      return res.redirect('/managerraise');
    }
    else {



      sqlquery = "UPDATE `galaxy`.`employee` SET `Salary` = "+(Number(results[0].salary)+Number(Mnum))    +" WHERE `ID` = " + Number(id) ;
      db.query(sqlquery, (err, results, fields) => {
        if(err)
         return console.log(err);
        console.log(results);
        req.flash('success',"Successful operation ")
        return res.redirect('/managerraise');
        
      });
    }
  });
});

module.exports = router;