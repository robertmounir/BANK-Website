const mysqlconnection  = require('./connection');
const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require ('bcrypt');

router.get('/', (req,res) => {
  if (req.isAuthenticated()) {
    const sqlquery1 = "select * from Customer where ID = " + req.user.ID ;
    mysqlconnection.query(sqlquery1, (err, results, fields) => {
      if (err) console.log(err);
      if (results[0]) {
        return res.redirect('/customer');
      }
      else {
        const sqlquery2 = "select * from Branch, Bank where Bank.Mgr = " + req.user.ID + " or Branch.Mgr = " + req.user.ID;
        mysqlconnection.query(sqlquery2, (err, results, fields) => {
          if(err) console.log(err);
          if(results[0]) {
            return res.redirect('./manager');
          }
          else res.redirect('./employee');
        });
      }
    });
  }
  else {
    res.render('register', {
    title: "Register",
    css: " ",
    href1: "register",
    button1: "Sign Up",
    href2: "login",
    button2: "Log In"
    });
  }
});

router.post('/', [
  body('email', 'Email Address Is Missing').notEmpty(),
  body('email', 'Invalid Email').isEmail(),
  body('username', 'ID Number Is Missing').notEmpty(),
  body('username',"ID Must Be Number").isNumeric(),
  body('Fname', 'First Name Is Missing').notEmpty(),
  body('Fname', 'First Name Can NOT Be Less Than 2 Characters').isLength({min: 2}),
  body('Fname', 'First Name Can NOT Be More Than 20 Characters').isLength({max: 20}),
  body('Fname', "Invalid First Name Value").isString(),
  body('Mname', 'Middle Name Is Missing').notEmpty(),
  body('Mname', "Middle Name Can Not Be More Than one Letter").isLength({max: 1}),
  body('Mname', "Invalid Middle Name Value").isString(),
  body('Lname', 'Last Name Is Missing').notEmpty(),
  body('Lname', 'Last Name Can NOT Be Less Than 2 Characters').isLength({min: 2}),
  body('Lname', 'Last Name Can NOT Be More Than 20 Characters').isLength({max: 20}),
  body('Lname', "Invalid Last Name Value").isString(),
  body('password', 'Password Is Misssing').notEmpty(),
  body('password', 'Password Can NOT Be Less Than 2 Characters').isLength({ min: 2 }),
  body('password', 'Password Can NOT Be More Than 75 Characters').isLength({max: 75}),
  body('BDate', "Birthady Is Missing").notEmpty(),
  body('BDate', "You Must Complete Your Birthdate").isDate(),
  body('Job', "Jop Is Missing").notEmpty(),
  body('Job', "Invalid Jop Value").isString(),
  body('Work_name', "Work Name Is Missing").notEmpty(),
  body("Work_name", "Invalid Work Name Value").isString(),
  body('Work_address', "Work Adress Is Missing").notEmpty(),
  body('Work_address', "Invalid Work Adress Value").isString(),
  body('human', "Gender Is Missing").notEmpty(),
  body('Phone_num', "Phone Number Is Missing").notEmpty(),
  body('Phone_num', "Phone Number Can Only Be A number").isNumeric(),
  body('Phone_num', "Phone Number Can Not Be Less Than 11 Digits").isLength({min: 11}),
  body("Phone_num", "Phone Number Can Be More Than 11 Digits").isLength({max: 11}),
], (req,res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('register', {
      title: "Register",
      css: " ",
      href1: "register",
      button1: "Register",
      href2: "login",
      button2: "Log In",
      errors: errors
    });
  }

  const id = req.body.username;
  var sqlquery = "select Customer.ID, Employee.ID from Customer, Employee where Customer.ID = " + Number(id) + " or Customer.Email_address = '" + req.body.email + "' or Customer.phone_num = " + req.body.Phone_num + " or Employee.ID = " + id + " or Employee.Email_address = '" + req.body.email + "' or Employee.Phone_num  = " + req.body.Phone_num;
  mysqlconnection.query(sqlquery, async(err, results, fields)=> {
    if(results.length > 0) {
      if(err) return console.log(err);
      req.flash('danger', 'This Data Is Already Registered');
      return res.redirect('/register');
    }
    else {
      const Fname = req.body.Fname;
      const Mname = req.body.Mname;
      const Lname = req.body.Lname;
      const email = req.body.email;
      const phone= req.body.Phone_num;
      const hashedPassword = await bcrypt.hash(req.body.password,3);
      const address =req.body.address;
      const date=req.body.BDate;
      const sex =req.body.human;
      const job =req.body.Job;
      const workname =req.body.Work_name;
      const workaddress =req.body.Work_address;
      const salary =req.body.salary;

      sqlquery = "insert into customer values (" + Number(id) + ",'" + Fname + "','" + Mname + "','" + Lname + "','" + email + "' ,'" + phone + "' ,'" + date + "' ,'" + sex + "' ,'" + "00:00:00.0000000" + "' ,'" + address + "' ," + salary + " ,'" + job + "' ,'" + workname + "' ,'" + workaddress + "' ,'" + hashedPassword + "');";
      mysqlconnection.query(sqlquery, (err, results, fields) => {
        if(err) return console.log(err);
        return res.redirect('/login');
      });
    }
  });
});

module.exports = router;


