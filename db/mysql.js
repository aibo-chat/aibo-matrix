const mysql = require('mysql2');

console.log(process.env.MYSQL_HOST)
console.log(process.env.MYSQL_USER)
console.log(process.env.MYSQL_PWD)
console.log(process.env.MYSQL_DB)
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  database: process.env.MYSQL_DB,
});

module.exports = connection;
