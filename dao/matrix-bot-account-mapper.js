const connection = require('../db/mysql');
const {tryJson} = require("../util/utils"); // 导入数据库连接

async function list() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM matrix_bot_account', (error, results) => {
      if (error) reject(error);
      for (let result of results) {
        result.config = tryJson(result.config);
        result.question_template = tryJson( result.question_template);
      }
      resolve(results);
    });
  });
}

async function updateAccessToken(id, access_token, refresh_token, device_id, expires_in_ms) {
  const query = 'UPDATE matrix_bot_account SET access_token = ?, refresh_token = ?, device_id = ?, expires_in_ms = ?  WHERE id = ?';
  const values = [access_token, refresh_token, device_id, expires_in_ms, id];
  await connection.promise().query(query, values);
}

async function updateStatusAndAccessToken(id, accessToken, status) {
  const query = 'UPDATE matrix_bot_account SET access_token = ? , status=? WHERE id = ?';
  const values = [accessToken, status, id];
  await connection.promise().query(query, values);
}

async function updateUpdateProfile(id, status) {
  const query = 'UPDATE matrix_bot_account SET update_profile = ?  WHERE id = ?';
  const values = [status, id];
  await connection.promise().query(query, values);
}

async function updateDisplayNameAndAvatarUrl(id, display_name, avatar_url) {
  const query = 'UPDATE matrix_bot_account SET update_profile = 0 ,display_name=? ,avatar_url=? WHERE id = ?';
  const values = [display_name, avatar_url, id];
  await connection.promise().query(query, values);
}

async function getById(id) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM matrix_bot_account where id=?', [id], (error, results) => {
      if (error) reject(error);
      let account = results[0];
      account.config = tryJson(account.config);
      account.question_template=tryJson( account.question_template)
      resolve(account);
    });
  });
}

async function getByLocalpart(localpart) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM matrix_bot_account where localpart=? limit 1', [localpart], (error, results) => {
      if (error) reject(error);
      let account = results[0];
      account.config = tryJson(account.config);
      account.question_template=tryJson( account.question_template)
      resolve(account);
    });
  });
}


module.exports = {
  list,
  updateStatusAndAccessToken,
  updateAccessToken,
  updateUpdateProfile,
  updateDisplayNameAndAvatarUrl,
  getById,
  getByLocalpart
};
