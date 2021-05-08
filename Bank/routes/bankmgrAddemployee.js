const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

router.get('/', ensureAuthenticated, (req, res) => {
  const sqlquery = "select * from  Bank where Bank.Mgr = " + req.user.ID ;
  db.query(sqlquery, (err, results, fields) => {
    if (err) return console.log(err);
    console.log(results);
    if (results[0]) {
      res.render('bankmgrAddemployee', {
        title: "Manager Add Employee",
        css: "bankmgrAddemployee",
        href1: "bankmgr",
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

router.post('/', [
  body('email', 'Email Address Is MISSING').notEmpty(),
  body('email', 'INVALID Email').isEmail(),
  body('username', 'ID Number Is MISSING').notEmpty(),
  body('username', "ID Must be Number").isNumeric(),
  body('Fname', 'First name Is MISSING').notEmpty(),
  body('Fname', 'Name Can NOT Be Less Than 2 Characters').isLength({ min: 2 }),
  body('Fname', 'Name Can NOT Be More Than 20 Characters').isLength({ max: 20 }),
  body('Mname', 'First name Is MISSING').notEmpty(),
  body('Lname', 'Last Name Is Missing').notEmpty(),
  body('Lname', 'Name Can NOT Be Less Than 2 Characters').isLength({ min: 2 }),
  body('Lname', 'Name Can NOT Be More Than 20 Characters').isLength({ max: 20 }),
  body('human', 'Gender Is MISSING').notEmpty(),
  body('Phone_num', 'Phone number Is MISSING').notEmpty(),
  body('Phone_num', "Phone Number Must Be Numebr").isNumeric(),
  body('Phone_num', "Phone Number Can Not Be Less Than 11 Digits").isLength({min : 11}),
  body('Phone_num', "Phone Number Can Not Be Greate Than 11 digits").isLength({max: 11}),
  body('address', 'address Is MISSING').notEmpty(),
  body('BDate', 'BDate Is MISSING').notEmpty(),
  body('Br_num', 'Branch Number Is MISSING').notEmpty(),
  body('Br_num', "Branch Number Must be Number").isNumeric(),
  body('Works_hours', 'Works_hours Is MISSING').notEmpty(),
  body('Works_hours', "Works_hours Must be Number").isNumeric(),
  body('salary', 'salary Is MISSING').notEmpty(),
  body('salary', "salary Must be Number").isNumeric(),
  body('password', 'Password Is MISSING').notEmpty(),
  body('password', 'Password Can NOT Be Less Than 2 Characters').isLength({ min: 2 }),
  body('password', 'Password Can NOT Be More Than 75 Characters').isLength({ max: 75 }),
], (req, res) => {
  const errors = validationResult(req).errors;
  if (errors.length) {
    return res.render('bankmgrAddemployee', {
      title: "Manager Add Employee",
      css: "bankmgrAddemployee",
      href1: "bankmgr",
      button1: "Account",
      href2: "logout",
      button2: "Log Out",
      username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
      bio: "",
      errors: errors
    });
  }

  const id = req.body.username;
  var sqlquery = "select Customer.ID, Employee.ID from Customer, Employee where Customer.ID = " + Number(id) + " or Customer.Email_address = '" + req.body.email + "' or Customer.phone_num = " + req.body.Phone_num + " or Employee.ID = " + id + " or Employee.Email_address = '" + req.body.email + "' or Employee.Phone_num = " + req.body.Phone_num;
  db.query(sqlquery, async (err, results, fields) => {
    if (results.length > 0) {
      if (err) return console.log(err);
      req.flash('danger', 'This Information Is Already Registered');
      return res.redirect('/bankmgrAddemployee');
    }
    else {
      const Fname = req.body.Fname;
      const Mname = req.body.Mname;
      const Lname = req.body.Lname;
      const email = req.body.email;
      const phone = req.body.Phone_num;
      const hashedPassword = await bcrypt.hash(req.body.password, 3);
      const address = req.body.address;
      const date = req.body.BDate;
      const sex = req.body.human;
      const BrNo = req.body.Br_num;
      const hours = req.body.Works_hours;
      const salary = req.body.salary;
        sqlquery = "select * from branch where ID = " + BrNo;
        db.query(sqlquery, async (err, results, fields) => {
          if (err) {
            return console.log(err);
          }
          if (results.length == 0) {
            req.flash('danger', 'There is no branch with this ID ');
            return res.redirect('/bankmgrAddemployee');
          }
      sqlquery = "insert into employee values (" + Number(id) + ",'" + Fname + "','" + Mname + "','" + Lname + "','" + email + "' ,'" + phone + "' ," + Number(BrNo) + " ,'" + sex + "' ,'" + address + "' ," + salary + " ,'" + date + "' ,'" + "00:00:00.0000000" + "' ," + Number(hours) + " ,'" + hashedPassword + "');";
        db.query(sqlquery, (err, results, fields) => {
          if (err) return console.log(err);
          console.log(results);
    
        return res.redirect('/bankmgrAddemployee');
      });
    });
    }
  });
});

module.exports = router;