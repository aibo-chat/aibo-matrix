const connection = require('../db/mysql'); // 导入数据库连接


module.exports = {
  insert: async function (task) {
    let {name, description, cron, content} = task;
    const query = 'INSERT INTO matrix_bot_task (name, description, cron, content) VALUES (?, ?, ?, ?)';
    const values = [name, description, cron, content];
    await connection.promise().query(query, values);
  },

  list: function () {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM matrix_bot_task where status=1',
        [], (error, results) => {
          if (error) reject(error);
          resolve(results);
        });
    });
  }
}

