const mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1230',
  database : 'galaxy'
});


connection.connect((err) => {
  if(err) throw err;
  else console.log('connected to mysql');
});

module.exports = connection;