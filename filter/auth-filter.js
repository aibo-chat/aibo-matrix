const axios = require('axios');

let ignores = process.env.AUTH_IGNORES;
let host = process.env.MATRIX_HOME_SERVER_URL;
ignores = ignores ? ignores.split(/\W*,\W*/) : []

module.exports = {
  authInfo: async function (req, res, next) {
    let path = req.path;
    for (let ignore of ignores) {
      if (path && ignore && path.startsWith(ignore)) {
        next();
        return;
      }
    }


    try {
      const authentication = req.headers["Authorization"] || req.headers["authorization"] || req.headers["AUTHORIZATION"];
      let token = authentication.substring("Bearer ".length);
      const path = "/_matrix/client/v3/account/whoami";
      const response = await axios.get(host + path, {
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${token}`
        }
      });
      const res = response.data;
      const user_id = res.user_id;
      if (!user_id) {
        res.status(401).json({error: 'Unauthorized'});
        return;
      }
      req.user = {user_id}
      next();
    } catch (e) {
      res.status(401).json({error: 'Unauthorized'});
      return;
    }
  }
}
