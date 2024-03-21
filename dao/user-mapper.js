const connection = require('../db/mysql'); // 导入数据库连接


module.exports = {
  list: function (time) {
    if (time) {
      return new Promise((resolve, reject) => {
        connection.query("SELECT proxy_address as localpart, handle_name as display_name, avatar_link as avatar_url, du.email as email\n" +
          "FROM defed_user as du\n" +
          "         left join sbt on sbt.uid = du.id\n" +
          "where (du.update_date > ? or sbt.update_date > ?) ",
          [time, time], (error, results) => {
            if (error) reject(error);
            resolve(results);
          });
      });
    } else {
      return new Promise((resolve, reject) => {
        connection.query("SELECT proxy_address as localpart,handle_name as display_name,avatar_link as avatar_url,defed_user.email as email FROM defed_user left join sbt on sbt.uid = defed_user.id",
          [], (error, results) => {
            if (error) reject(error);
            resolve(results);
          });
      });
    }
  }
};
