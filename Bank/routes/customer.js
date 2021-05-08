const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');

router.get('/', ensureAuthenticated,(req, res) => {
  const sqlquery = "select * from customer where ID = " + req.user.ID;
  db.query(sqlquery, (err, results, fields) => {
    if (err) console.log(err);
    if (results[0]) {
      return res.render('customer', {
        title: "Customer",
        css: "profile",
        href1: "customer",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
        ID: req.user.ID,
        Email : req.user.Email_address,
        PhoneNo: req.user.Phone_num,
        BDate : (req.user.BDate),
        Address : req.user.Address,
        Job :req.user.Job,
        WorkName : req.user.Work_Name,
        WorkAddress :req.user.Work_Address,
        Salary : req.user.Salary
      });
    }
    else res.redirect('./login'); 
  });
});

module.exports = router;