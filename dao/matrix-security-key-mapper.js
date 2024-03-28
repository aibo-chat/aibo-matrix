const connection = require('../db/mysql'); // 导入数据库连接


module.exports = {
  insert: async function (user_id, security_key) {
    const query = 'INSERT INTO matrix_security_key (user_id,security_key) VALUES (?, ?)';
    const values = [user_id, security_key];
    let res = await connection.promise().query(query, values);
    return res[0]['insertId'];
  },
  getByUserId: async function (user_id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM matrix_security_key where user_id = ? limit 1', [user_id], (error, results) => {
        if (error) reject(error);
        resolve(results[0]);
      });
    });
  }
}

