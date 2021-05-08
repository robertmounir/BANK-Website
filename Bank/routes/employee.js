const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');

router.get('/', ensureAuthenticated, (req, res) =>{
  const sqlquery = "select * from employee where ID = " + req.user.ID + " and employee.ID not in (select Mgr from bank where Mgr = " + req.user.ID + ") and employee.ID not in (select Mgr from branch where Mgr = " + req.user.ID + ")";
  db.query(sqlquery, (err, results, fields) => {
    if(err) return console.log(err);
    if(results[0]){
        return res.render('employee', {
        title: "employee",
        css: "employee",
        href1: "employee",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
        ID: req.user.ID,
        Email : req.user.Email_address,
        PhoneNo: req.user.Phone_num,
        BDate : req.user.BDate,
        Address : req.user.Address,
        Salary : req.user.Salary,
        Branch : req.user.Br_num,
        hours : req.user.Works_hours
      });
    }
  else return res.redirect('./login');
  });
});

module.exports = router;
