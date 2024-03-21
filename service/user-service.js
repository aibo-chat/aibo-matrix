const axios = require("axios");
const userMapper = require("../dao/user-mapper")
const {MatrixClient} = require("matrix-bot-sdk");

async function list(req) {
  let {homeserver} = req;
  let arr = await userMapper.list();
  for (let u of arr) {
    u.user_id = "@" + u.user_id + ":" + homeserver;
  }
  return arr;
}

async function register(req) {
  let {token, base_url, users} = req;
  if (!token) throw "not token";
  if (!Array.isArray(users)) throw "not users";
  if (!base_url) throw "not base_url";
  const HOME_SERVER_URL = process.env.MATRIX_HOME_SERVER_URL;
  let client = new MatrixClient(HOME_SERVER_URL, token);

  let msg = "";
  let results = [];
  try {
    for (let user of users) {
      const url = base_url + '/_synapse/admin/v2/users/' + encodeURIComponent(user.user_id);
      const headers = {
        'authorization': "Bearer " + token,
        'Content-Type': 'application/json'
      };
      let data = {};
      if (user.displayname) {
        data.displayname = user.displayname;
      }
      if (user.avatar_url) {
        let mac = await client.uploadContentFromUrl(user.avatar_url);
        data.avatar_url = mac;
      }
      const response = await axios.put(url, data, {headers: headers, timeout: 2 * 60 * 1000});
      results.push(user.user_id);
    }
  } catch (e) {
    msg = e.message;
    console.log(e);
  }

  return {code: 0, data: {results, msg}}
}


module.exports = {register, list};
