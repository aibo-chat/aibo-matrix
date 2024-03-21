const matrixBotUserMapper = require("../dao/matrix-bot-user-mapper")

async function handle(bot, room_id, sender, ques) {
  let user = {localpart: bot.localpart, user_id: sender};
  await matrixBotUserMapper.saveUser(user);
}

module.exports = {handle}

