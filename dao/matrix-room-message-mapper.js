const connection = require('../db/mysql'); // 导入数据库连接


module.exports = {


  save: async function (chat) {
    let {room_id, user_id, event_id, message} = chat;
    const query = 'INSERT IGNORE INTO matrix_room_message ( room_id, user_id, event_id, message) VALUES ( ?, ?, ?, ?)';
    const values = [room_id, user_id, event_id, message];
    let res = await connection.promise().query(query, values);
    return res[0]['insertId'];
  }
}

