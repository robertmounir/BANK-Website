const express = require ('express');
const path = require('path');
const session = require ('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');

const app = express();
require('./passport-config/config')(passport);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: "keyboard cat", resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.listen(3000, (err) => {
  if(err) throw err;
  console.log("started listening at port 3000...")
});

app.use('/login', require('./routes/login'));
app.use('/bank', require('./routes/bank'));
app.use('/register', require('./routes/register'));
app.use ('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));

//customer
app.use('/customer', require('./routes/customer'));
app.use('/customerCheck', require('./routes/customerCheck'));
app.use('/customercreditcard', require('./routes/customercreditcard'));
app.use('/customerdepitcard', require('./routes/customerdepitcard'));
app.use('/customerdeposite', require('./routes/customerdeposite'));
app.use ('/customerloan', require('./routes/customerloan'));
app.use ('/customerTransaction', require('./routes/customerTransaction'));
app.use ('/customerWithdraw', require('./routes/customerWithdraw'));

//employee
app.use ('/employee', require('./routes/employee'));
app.use ('/employeeCloseaccount', require('./routes/employeeCloseaccount'));
app.use ('/employeeCreateaccount', require('./routes/employeeCreateaccount'));
app.use ('/employeeGiveloan', require('./routes/employeeGiveloan'));
app.use ('/employeedeletecreditcard', require('./routes/employeedeletecreditcard'));
app.use ('/employeedeletedebitcard', require('./routes/employeedeletedebitcard'));
app.use ('/employeeTransactions', require('./routes/employeeTransactions'));

//manager
app.use('/manager', require('./routes/manager'));
app.use('/manageraddemployee', require('./routes/manageraddemployee'));
app.use('/managerRAemployeebranch', require('./routes/managerRAemployeebranch'));
app.use('/managerraise', require('./routes/managerraise'));
app.use('/managerremoveemployee', require('./routes/managerremoveemployee'));
app.use('/Managerialstatistics', require('./routes/Managerialstatistics'));
app.use('/withdraw', require('./routes/withdraw'));
app.use('/deposit', require('./routes/deposit'));
app.use('/transaction', require('./routes/transaction'));
app.use('/loan', require('./routes/loan'));

//bankMgr 

app.use('/bankmgr', require('./routes/bankmgr'));
app.use('/bankmgrAddemployee', require('./routes/bankmgrAddemployee'));
app.use('/bankmgrAddmanager', require('./routes/bankmgrAddmanager'));

app.use('/employeechangepassword', require('./routes/employeechangepassword'));
app.use('/customerchangepassword', require('./routes/customerchangepassword'));
app.use('/managerchangepassword', require('./routes/managerchangepassword'));

app.use('/bankmgrchangepassword', require('./routes/bankmgrchangepassword'));



//404//
app.use((req, res, next) => {
  res.status(404).render('404');
});






