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
      return res.render('employeeTransactions', {
        title: "employeeTransactions",
        css: "employeeTransactions",
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
  body('AID', 'SENDER ID Number Is MISSING').notEmpty(),
  body('AID',"ID Must be Number").isNumeric(),
  body('CID', 'Customer ID Number Is MISSING').notEmpty(),
  body('CID',"ID Must be Number").isNumeric(),
  body('RID',"Reciver ID IS MISSING").notEmpty(),
  body('RID',"ID Must be Number").isNumeric(),
  body('Money', 'Quantity Is MISSING').notEmpty(),
  body('Money',"Quantity Must be Number").isNumeric()
], (req, res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    return res.render('employeeTransactions', {
      title: "employeeTransactions",
      css: "employeeTransactions",
      href1: "employee",
      button1: "Account",
      href2: "logout",
      button2: "Log Out",
      username: req.user.Fname + " "+req.user.Mname + " " + req.user.Lname,
      errors: errors
    });
  }
  var sqlquery = "select * from account where ID = " + req.body.AID + " and Cust = " + req.body.CID + " and bank_id in (select bankID from branch where ID = " + req.user.Br_num + ")";
  db.query(sqlquery, (err, results1, fields) => {
    if(err) return console.log(err);
    if(!results1[0]) {
      req.flash('danger', "You do NOT have an account with this ID");
      return res.redirect('/employeeTransactions');
    }
    else {
      sqlquery = "select * from account where ID = " + req.body.RID;
      db.query(sqlquery, (err, results2, fields) => {
        if(err) return console.log(err);
        if(!results2[0]) {
          req.flash('danger', "There is NO account with this ID");
          return res.redirect('/employeeTransactions');
        }
        else {
          if(results1[0].Amount < req.body.Money) {
            req.flash('danger', "No enough money");
            return res.redirect('/customerTransaction');
          }
          const sqlquery1 = "update account set Amount = Amount - " + req.body.Money + " where ID = " + req.body.AID;
          db.query(sqlquery1, (err1, rows1, fields) => {
            if(err1) console.log(err1);
            const amount = Number(results1[0].Amount) - Number(req.body.Money);
            req.flash('success',"Successful operation");
            return res.redirect('/employeeTransactions');
          });
          const sqlquery2 = "update account set Amount = Amount + " + req.body.Money + " where ID = " + req.body.RID;
          db.query(sqlquery2, (err2) => {
            if(err2) console.log(err2);
          });
          const sqlquery3 = "insert into transactions (Sender_ID, Reciever_ID, Amount) values (" + req.body.AID + ", " + req.body.RID + ", " + req.body.Money + ");";
          db.query(sqlquery3, (err3) => {
            if(err3) return console.log(err3);
          });
        }
      });
    }
  });
});


module.exports = router;
