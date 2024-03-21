const connection = require('../db/mysql'); // 导入数据库连接


module.exports = {
  insert: async function (chat) {
    let {localpart, room_id, user_id, room_type, question} = chat;
    const query = 'INSERT INTO matrix_bot_chat (localpart, room_id, user_id, room_type, question) VALUES (?, ?, ?, ?, ?)';
    const values = [localpart, room_id, user_id, room_type, question];
    let res = await connection.promise().query(query, values);
    return res[0]['insertId'];
  },
  updateAnswer: async function (id, answer) {
    const query = 'UPDATE matrix_bot_chat SET answer = ? WHERE id = ?';
    const values = [answer, id];
    await connection.promise().query(query, values);
  }
}

