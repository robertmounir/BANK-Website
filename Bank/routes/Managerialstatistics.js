const router = require('express').Router();
const { ensureAuthenticated } = require('../passport-config/auth');
const db = require('./connection');

router.get('/', ensureAuthenticated, (req, res) => {
    const sqlquery = "select * from employee where ID = " + req.user.ID + " and (employee.ID in (select Mgr from bank where Mgr = " + req.user.ID + ") or employee.ID in (select Mgr from branch where Mgr = " + req.user.ID + "))";
    db.query(sqlquery, (err, results, fields) => {
        if (err) return console.log(err);
        if (results[0]) {
            const statisticsquery = "select count(*) as empscount, min(Salary) as minsal, max(Salary) as maxsal, avg(Salary) as avgsal, max(Works_hours) as maxhours, min(Works_hours) as minhours, avg(Works_hours) as avghours from employee where Br_num = " + req.user.Br_num;
            db.query(statisticsquery, (err, statistics, fields) => {
                console.log(statistics);
                if(err) return console.log(err);
                return res.render('Managerialstatistics', {
                    title: "Managerial statistics",
                    css: "Managerialstatistics",
                    href1: "manager",
                    button1: "Account",
                    href2: "logout",
                    button2: "Log Out",
                    username: req.user.Fname + " " + req.user.Mname + " " + req.user.Lname,
                    ID: req.user.ID,
                    statistics: statistics[0]
                });
            });
        }
        else {
            return res.redirect('./login');
        }
    })
});

module.exports = router;