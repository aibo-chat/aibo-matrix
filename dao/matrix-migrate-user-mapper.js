const connection = require('../db/mysql'); // 导入数据库连接


module.exports = {
  listMigrateUser: async function (status = 0) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM matrix_migrate_user where status = ? ', [status], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });
  },
  getMigrateUser: async function (localpart) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM matrix_migrate_user where localpart = ? limit 1', [localpart], (error, results) => {
        if (error) reject(error);
        resolve(results[0]);
      });
    });
  },
  updateStatus: async function (id, status = 1) {
    const query = 'UPDATE matrix_migrate_user SET status = ? WHERE id = ?';
    const values = [status, id];
    await connection.promise().query(query, values);
  },

  saveMigrateUser: async function (user) {
    let {localpart, user_id, display_name, avatar_url} = user;
    try {
      user = await this.getMigrateUser(localpart);
      if (user) {
        if (!display_name) display_name = '';
        if (!avatar_url) avatar_url = '';
        if (display_name == user.display_name && avatar_url == user.avatar_url) return user;

        display_name = display_name || user.display_name;
        avatar_url = avatar_url || user.avatar_url;
        const query = 'UPDATE matrix_migrate_user SET display_name = ?, avatar_url = ?, status = ? WHERE id=?';
        const values = [display_name, avatar_url, 0, user.id];
        await connection.promise().query(query, values);
        return await this.getMigrateUser(localpart);
      }

      // 如果记录不存在，执行插入操作
      const query = 'INSERT INTO matrix_migrate_user (localpart, user_id, display_name, avatar_url, status) VALUES (?, ?, ?, ?, ?)';
      const values = [localpart, user_id, display_name || "", avatar_url || "", 0];
      await connection.promise().query(query, values);
      user = await this.getMigrateUser(localpart);
      return user;
    } catch (err) {
      console.error('发生错误: ' + err.message);
    }
  }
};
