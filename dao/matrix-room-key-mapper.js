const connection = require('../db/mysql'); // 导入数据库连接


module.exports = {
  save: async function (key) {
    let {user_id, room_id, session_id, session_key} = key
    const query = 'INSERT IGNORE INTO matrix_room_key ( user_id, room_id, session_id, session_key) VALUES (?, ?, ?, ?)';
    const values = [user_id, room_id, session_id, session_key];
    let res = await connection.promise().query(query, values);
    return res[0]['insertId'];
  },
  list: async function (user_id, time) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM matrix_room_key where user_id=? and create_date > ?',
        [user_id, time], (error, results) => {
          if (error) reject(error);
          resolve(results);
        });
    });
  }
}

