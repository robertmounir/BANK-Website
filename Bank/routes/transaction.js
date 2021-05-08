
const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');
const { body, validationResult } = require('express-validator');
const bcrypt = require ('bcrypt');

  
router.get('/', ensureAuthenticated, (req, res) => {
  const sqlquery = "select * from employee where ID = " + req.user.ID + " and (employee.ID in (select Mgr from bank where Mgr = " + req.user.ID + ") or employee.ID in (select Mgr from branch where Mgr = " + req.user.ID + "))";
  db.query(sqlquery, (err, results, fields) => {
    if(err) return console.log(err);
    console.log(results);
    if(results[0]) {
      res.render('transaction', {
        title: "Transactions History ",
        css: "transaction",
        href1: "manager",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " " +req.user.Mname + " " + req.user.Lname,
    
      });
    }
    else {
      return res.redirect('./login');
    }
  })
});

router.post('/', [

], (req,res) => {
  const errors = validationResult(req).errors;
  if(errors.length) {
    returnres.render('transaction', {
        title: "Transactions History ",
        css: "transaction",
        href1: "manager",
        button1: "Account",
        href2: "logout",
        button2: "Log Out",
        username: req.user.Fname + " " +req.user.Mname + " " + req.user.Lname,
        
        errors: errors,
     

      });
  }

  const date= req.body.date;
  const order = req.body.order;

      var sqlquery_= "select concat(a.Fname,' ',a.Mname,' ',a.Lname) as Sender,concat(b.Fname,' ',b.Mname,' ',b.Lname) as Receiver,tr.Amount,tr.trans_date "
      +"from Customer a inner join Customer b on a.ID<>b.id inner join account c on c.Cust=a.ID inner join account d on d.Cust=b.ID inner join Transactions tr on c.ID=tr.Sender_ID and tr.Reciever_ID=d.id where trans_date<'"+
      date+"' order by "+order+";";

      db.query(sqlquery_, (err, results, fields) => {
        if(err)
         return console.log(err);
        console.log(results);
        var td="<td style='text-align: left;padding: 8px; color:black; border: 1px solid gray;'>";
var th="<th style='text-align: left;padding: 8px;  border: 1px solid gray; background-color: #4CAF50;color: white;'>";
var code="<body style='color:white;'><table style='border-collapse: collapse;width: 100%;  border: 1px solid black;'>"+
+"<tr>"+th+"Sender Name</th>"+th+"Receiver Name</th>"+th+"Amount</th>"+th+"Transaction Date</th></tr>";

    for (i = 0; i < results.length; i++) {
      code+="<tr>"+td+results[i].Sender+"</td>"+td+results[i].Receiver+"</td>"+td+results[i].Amount+"</td>"+td+results[i].trans_date+"</td></tr>";
    }
        code+="</Table></body>";
        return res.send(code);
        
      });
});

module.exports = router;