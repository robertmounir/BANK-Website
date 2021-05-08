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
      return res.render('employeedeletecreditcard', {
        title: "employeedeletecreditcard",
        css: "employeedeletecreditcard",
        href1: "employee",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " "+req.user.Mname + " " + req.user.Lname,
      });
    }
    else return res.redirect('./login');
  });
});

router.post('/', ensureAuthenticated, [
  body('CCID', "Credit Card Is Missing").notEmpty(),
  body('CCID', "Credit Card ID Must Be A Number").isNumeric(),
  body('CID', "Customer ID Is Missing").notEmpty(),
  ], (req,res) => {
    const errors = validationResult(req).errors;
    if(errors.length) {
      return res.render('employeedeletecreditcard', {
        title: "employeedeletecreditcard",
          css: "employeedeletecreditcard",
          href1: "employee",
          button1: "Account",
          href2: "logout",
          button2: "Log Out",
          username: req.user.Fname + " "+req.user.Mname + " " + req.user.Lname,
          errors: errors
      });
    }
    var sqlquery = "select CC_ID from credit_card where CC_ID = " + req.body.CCID + " and bank_id in (select bankID from branch where ID = " + req.user.Br_num + ")";
    db.query(sqlquery, (err, results, fields) => {
      if(err) return console.log(err);
      if(!results[0]) {
        req.flash('danger', "There Is No credit Card With This ID");
        return res.redirect('/employeedeletecreditcard');
      }
      else {
        sqlquery = "select ID from customer where ID = " + req.body.CID;
        db.query(sqlquery, (err, results, fields) => {
          if(err) return console.log(err);
          if(!results[0]) {
            req.flash('danger', "There Is No Customer With This ID");
            return res.redirect('/employeedeletecreditcard');
          }
          else {
            sqlquery = "delete from credit_card where CC_ID = " + req.body.CCID;
            db.query(sqlquery,(err) => {
              if(err) return console.log(err);
              req.flash('success',"Successful operation");
              return res.redirect('/employeedeletecreditcard')
            });
          }
        }); 
      }
    });
});
  

module.exports = router;
