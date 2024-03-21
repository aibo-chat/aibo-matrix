const connection = require('../db/mysql'); // 导入数据库连接

module.exports = {
  insert: async function (msg) {
    let {localpart, user_id, room_id, message, send_time} = msg;
    const query = 'INSERT INTO matrix_bot_room (localpart, user_id, room_id, message, send_time) VALUES (?, ?, ?, ?, ?)';
    const values = [localpart, user_id, room_id, message, send_time];
    await connection.promise().query(query, values);
  },

  queryTodoMessage: function () {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM matrix_bot_send_message where status = 0 and send_time < ?',
        [new Date(Date.now() + 30 * 1000)], (error, results) => {
          if (error) reject(error);
          resolve(results);
        });
    });
  },

  updateMessage: async function (id, status, result_msg) {
    const query = 'UPDATE matrix_bot_send_message SET status = ?, result_msg=? WHERE id = ?';
    const values = [status, result_msg, id];
    await connection.promise().query(query, values);

  },

  getMinSendTime: function () {
    return new Promise((resolve, reject) => {
      connection.query('SELECT min(send_time) FROM matrix_bot_send_message where status=0 ',
        [], (error, results) => {
          if (error) reject(error);
          resolve(results[0]);
        });
    });
  }

}
