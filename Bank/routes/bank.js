const router = require('express').Router();
const db = require('./connection');


router.get('/', (req,res) => {
  if (req.isAuthenticated()) {
    const sqlquery = "select * from Customer where ID = " + req.user.ID;
    db.query(sqlquery, (err, results, fields) => {
      if (err) console.log(err);
      if (results[0]) {
        return res.render('bank', {
          title: "Bank",
          css: "bank",
          href1: "customer",
          button1: "Account",
          href2: "logout",
          button2: "Log Out"
        });
      }
      else {
        const sqlquery2 = "select * from Branch, Bank where Bank.Mgr = " + req.user.ID + " or Branch.Mgr = " + req.user.ID;
        db.query(sqlquery2, (err, results, fields) => {
          if(err) console.log(err);
          if(results[0]) {
            return res.render('bank', {
              title: "Bank",
              css: "bank",
              href1: "manager",
              button1: "Account",
              href2: "logout",
              button2: "Log Out"
            });
          }else
          {
            const sqlquery3 = "select * from employee where ID = " + req.user.ID ;
            db.query(sqlquery3, (err, results, fields) => {
              if(err) console.log(err);
              if(results[0]) {
                return res.render('bank', {
                  title: "Bank",
                  css: "bank",
                  href1: "manager",
                  button1: "Account",
                  href2: "logout",
                  button2: "Log Out"
                
            });
          }
                
        });
          }
        });
      }

    
    });
  }
   
  else {
    res.render('bank', {
    title: "Bank",
    css: "bank",
    href1: "register",
    button1: "Sign Up",
    href2: "login",
    button2: "Log In"
    }); 
  }
});

module.exports = router;