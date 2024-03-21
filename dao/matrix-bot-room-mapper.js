const connection = require('../db/mysql'); // 导入数据库连接


module.exports = {
  insert: async function (localpart, room_id, chat_id, type) {
    const query = 'INSERT INTO matrix_bot_room (localpart, room_id, chat_id) VALUES (?, ?, ?)';
    const values = [localpart, room_id, chat_id];
    await connection.promise().query(query, values);
  },

  getByLocalpartAndRoomId: async function getByLocalpartAndRoomId(localpart, room_id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM matrix_bot_room where localpart=? and room_id=? limit 1',
        [localpart, room_id], (error, results) => {
          if (error) reject(error);
          resolve(results[0]);
        });
    });
  }
}

