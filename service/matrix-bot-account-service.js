let matrixBotAccountMapper = require('../dao/matrix-bot-account-mapper')
let {setProfile} = require("../matrix/matrix")

async function list() {
  let bots = await matrixBotAccountMapper.list();
  for (let bot of bots) {
    delete bot.password;
    delete bot.access_token;
    delete bot.refresh_token;
    delete bot.device_id;
    delete bot.expires_in_ms;
  }

  return {code: 0, data: bots}
}

async function updateBotInfo(req) {
  let {localpart, display_name, avatar_url} = req;
  let bot = await matrixBotAccountMapper.getByLocalpart(localpart);
  if (!bot) return {code: 1, msg: 'Bot not exists'}
  let is_update = false;
  if (display_name && bot.display_name != display_name) {
    await setProfile(bot, display_name, null);
    bot.display_name = display_name
    is_update = true;
  }
  if (avatar_url && bot.avatar_url != avatar_url) {
    await setProfile(bot, null, avatar_url);
    bot.avatar_url = avatar_url
    is_update = true;
  }
  if (is_update) {
    await matrixBotAccountMapper.updateDisplayNameAndAvatarUrl(bot.id, bot.display_name, bot.avatar_url)
  }
  return {code: 0, data: true}
}

module.exports = {list, updateBotInfo};
