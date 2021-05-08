const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../routes/connection');

module.exports = function (passport) {
  passport.use( 
    new LocalStrategy({ usernameField: 'username'}, (username, password, done) => {
      let sqlquery = "select * from customer where ID = " + username;
      db.query(sqlquery, (err, results, fields) => {
        if(err) return console.log(err);
        else if(results[0]) {
          bcrypt.compare(password, results[0].password, (err, isMatch) => {
            if(err) return console.log(err);
            if(isMatch){
              sqluser = "customer";
              return done(null,results[0]);
            } else {
              return done(null, false, 'password incorrect');
            }
          });    
        }
        else {
          let sqlquery = "select * from Employee where ID = " + username + " and Br_num is not null";
          db.query(sqlquery, (err, results, fields) => {
            if(err) return console.log(err);
            else if(results[0]) {
              bcrypt.compare(password, results[0].password, (err, isMatch) => {
                if(err) return console.log(err);
                if(isMatch){
                  return done(null,results[0]);
                } else {
                  return done(null, false, 'password incorrect');
                }
              }); 
            }
            else {
              return done(null, false, {message:'this id is not registered'});
            }
          });  
       }
      });   
    })
  );

  passport.serializeUser((results, done) => {
    done(null, results);
  });

  passport.deserializeUser((results, done) => {
    done(null, results);
  });

}