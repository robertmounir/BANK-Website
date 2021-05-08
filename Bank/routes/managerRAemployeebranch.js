const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

router.get('/', ensureAuthenticated, (req, res) => {
  const sqlquery = "select * from employee where ID = " + req.user.ID + " and  employee.ID in (select Mgr from branch where Mgr = " + req.user.ID + ")";
  db.query(sqlquery, (err, results, fields) => {
    if (err) return console.log(err);
    if (results[0]) {
      res.render('managerRAemployeebranch', {
        title: "Manager A/R Employee",
        css: "managerRAemployeebranch",
        href1: "manager",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
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
  body('EID', "ID Must be Number").isNumeric(),
  body('BID', 'ID Number Is MISSING').notEmpty(),
  body('BID', "ID Must be Number").isNumeric()

], (req, res) => {
  const errors = validationResult(req).errors;
  if (errors.length) {
    return res.render('managerRAemployeebranch', {
      title: "Manager A/R Employee",
      css: "managerRAemployeebranch",
      href1: "manager",
      button1: "Account",
      href2: "logout",
      button2: "Log Out",
      username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
      bio: "",
      errors: errors
    });
  }
  const Bid = req.body.BID;
  const id = req.body.EID;
  const t = req.body.btn;

  var sqlquery = "select ID from branch where ID = " + Number(Bid);
  db.query(sqlquery, async (err, results, fields) => {
    if (err) {
      return console.log(err);
    }
    if (results.length == 0) {
      req.flash('danger', 'There is no Branch with this ID');
      return res.redirect('/managerRAemployeebranch');
    }
    const testquery = "select ID from employee where Br_num is null and ID = " + req.body.EID; 
    db.query(testquery, (err, rows, fields) => {
      if(err) return console.log(err);
      else if(rows[0] && t != "R"){
        db.query("update employee set Br_num = " + req.body.BID + " where ID = " + req.body.EID, (err) => {
          if(err) return console.log(err);
          req.flash('success', "Successful Operation");
          return res.redirect('/managerRAemployeebranch');
        });
      }
      else {
        var sqlquery = "select employee.ID, Br_num from employee join branch on Br_num = branch.ID join bank on bank.ID = branch.bankID where employee.ID = " + Number(id) + " and branch.Mgr = " + req.user.ID + " and bank.Mgr != " + id;
        db.query(sqlquery, async (err, results, fields) => {
          if (err) {
            return console.log(err);
          }
          console.log(results);
          if (results.length == 0) {
            req.flash('danger', 'There is no Employee with this ID');
            return res.redirect('/managerRAemployeebranch');
          } else {
            if(req.user.ID == req.body.EID) {
              req.flash('danger', "You Can Not Remove Your Self!");
              return res.redirect('/managerRAemployeebranch');
            }
            if (t == "R") {
              if (results[0].Br_num != Bid) {
                req.flash('danger', 'he dose not work at this branch');
                return res.redirect('/managerRAemployeebranch');
              }
              else
              sqlquery = "UPDATE `galaxy`.`employee` SET `Br_num` = NULL WHERE `ID` = " + Number(id) + " and Br_num = " + Number(Bid);
            }
            else {
              if (Number(results[0].Br_num) == Number(Bid)) {
                req.flash('success', 'He/She Already Works At This Branch');
                return res.redirect('/managerRAemployeebranch');
              }
              sqlquery = "UPDATE `galaxy`.`employee` SET `Br_num` = " + Number(Bid) + " where `ID` = " + Number(id);
            }
            db.query(sqlquery, (err, results, fields) => {
              if (err) return console.log(err);
              req.flash('success', "Successful Operation");
              return res.redirect('/managerRAemployeebranch');
            });
          }
        });
      }
    });
  });
});


module.exports = router;