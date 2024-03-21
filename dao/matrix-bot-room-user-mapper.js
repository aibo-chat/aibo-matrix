const connection = require('../db/mysql'); // 导入数据库连接


module.exports = {
  save: async function (item) {
    let {localpart, room_id, user_id, room_type} = item;
    const query = 'INSERT IGNORE INTO matrix_bot_room_user ( localpart, room_id, user_id, room_type) VALUES ( ?, ?, ?, ?)';
    const values = [localpart, room_id, user_id, room_type];
    let res = await connection.promise().query(query, values);
    return res[0]['insertId'];
  },
  listByLocalpartUserIdRoomType: function (localpart, user_id, room_type) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM matrix_bot_room_user where localpart=? and user_id=? and room_type=? order by create_date desc',
        [localpart, user_id, room_type], (error, results) => {
          if (error) reject(error);
          resolve(results);
        });
    });
  }

}

