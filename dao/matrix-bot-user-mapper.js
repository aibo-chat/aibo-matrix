const connection = require('../db/mysql'); // 导入数据库连接


module.exports = {
  getUser: async function (localpart, user_id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM matrix_bot_user where localpart=? and  user_id = ? limit 1', [localpart, user_id], (error, results) => {
        if (error) reject(error);
        resolve(results[0]);
      });
    });
  },

  updateCallCount: async function (id, call_date, call_count) {
    const query = 'UPDATE matrix_bot_user SET call_date = ?, call_count=? WHERE id=?';
    const values = [call_date, call_count, id];
    await connection.promise().query(query, values);
  },

  decreaseCallCount: async function (localpart, user_id) {
    const query = 'UPDATE matrix_bot_user SET call_count=call_count-1 WHERE localpart = ? and user_id = ?';
    const values = [localpart, user_id];
    await connection.promise().query(query, values);
  },

  saveUser: async function (user) {
    let {localpart, user_id} = user;
    try {
      let user = await this.getUser(localpart, user_id);
      if (user) return user;
      // 如果记录不存在，执行插入操作
      const query = 'INSERT INTO matrix_bot_user (localpart, user_id) VALUES (?, ?)';
      const values = [localpart, user_id];
      await connection.promise().query(query, values);
      user = await this.getUser(localpart, user_id);
      return user;
    } catch (err) {
      console.error('发生错误: ' + err.message);
    }
  }
};
