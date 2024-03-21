const matrixBotSendMessageMapper = require("../dao/matrix-bot-send-message-mapper");
const matrixBotAccountMapper = require("../dao/matrix-bot-account-mapper");
const matrix = require("../matrix/matrix");
const userMapper = require("../dao/user-mapper");
const migrateUserMapper = require("../dao/matrix-migrate-user-mapper");
const axios = require("axios");

module.exports = {
  migrateUser: async function (time) {
    let home_server = process.env.MATRIX_HOME_SERVER;
    if (!home_server) {
      console.log("Please configure home server: MATRIX_HOME_SERVER")
      return;
    }

    let arr = await userMapper.list(time);
    for (let user of arr) {
      user.user_id = "@" + user.localpart + ":" + home_server;
      await migrateUserMapper.saveMigrateUser(user);
      console.log(`save user ${user.user_id} ${user.display_name} ${user.avatar_url}`);
    }

    arr = await migrateUserMapper.listMigrateUser(0);
    for (let user of arr) {
      try {
        let {user_id, display_name, avatar_url} = user;
        if (avatar_url) {
          avatar_url = await matrix.uploadContentFromUrl("adminbot", user.avatar_url);
        }
        let external_ids = [{
          "auth_provider": "oidc-defed",
          "external_id": user.localpart
        }]
        let response = await matrix.adminRegisterUser("adminbot", user_id, display_name, avatar_url, external_ids)
        console.log("migrate user to matrix, register user:" + JSON.stringify(user));
        console.log(JSON.stringify(response));
        await migrateUserMapper.updateStatus(user.id, 1);
      } catch (e) {
        console.log("migrate user:" + JSON.stringify(user))
        console.log(e);
      }
    }
    return arr;
  }
}

