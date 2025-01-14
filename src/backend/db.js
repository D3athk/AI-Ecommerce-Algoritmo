const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root', // Alterar se necessário
  password: 'root', // Alterar se necessário
  database: 'loja',
});





module.exports = db;