const matrix = require("../matrix/matrix")
const matrixBotAccountMapper = require("../dao/matrix-bot-account-mapper")
const matrixBotChatMapper = require('./../dao/matrix-bot-chat-mapper')
const {createRateLimiter, tryJson} = require('../util/utils')
const helpProcessor = require('./help-processor')
const qaProcessor = require('./qa-processor')
const infoProcessor = require('./info-processor')
const userProcessor = require('./user-processor')
const memberProcessor = require('./member-processor')
const taskProcessor = require('./task-processor')


global.throttles = {}

async function main() {
  if (process.env.NODE_ENV == 'dev' && !process.env.DEV_START_BOT) {
    console.error("!!!!!!!!!!!dev environment, without starting any bots!!!!!!!!!!!")
    return;
  }
  let bots = await matrixBotAccountMapper.list();
  for (let bot of bots) {
    //如果是aibodev 则必须是dev环境才启动
    if ((bot.localpart == 'aibodev' && process.env.NODE_ENV == 'dev')
      || (bot.localpart != 'aibodev' && process.env.NODE_ENV != 'dev')) {
      await start(bot);
    }
  }
  timerRefresh();
}

/**
 * 定时检查access token是否快过期，如果快过期就刷新
 */
function timerRefresh() {
  setInterval(async () => {
    let bots = await matrixBotAccountMapper.list();
    for (let bot of bots) {
      //如果没有刷新token，就返回
      if (!bot.refresh_token || !bot.expires_in_ms) continue;
      //过期时间还不到2分钟，就返回
      if (bot.expires_in_ms > Date.now() + 30 * 60 * 1000) continue
      //刷新
      try {
        console.log(JSON.stringify(bot));
        let res = await matrix.refreshToken(bot.localpart, bot.refresh_token);
        if (!res) continue;
        let {access_token, expires_in_ms, refresh_token} = res;
        await matrixBotAccountMapper.updateAccessToken(bot.id, access_token, refresh_token, bot.device_id, expires_in_ms);
      } catch (e) {
        console.log(e)
      }
    }
  }, 60 * 1000);
}


async function start(bot) {
  throttles[bot.localpart] = createRateLimiter(bot.reply_rate || 50);

  //如果状态为-1，那么就开启注册
  if (bot.status == -1) {
    let access_token = await matrix.register(bot.localpart, bot.password);
    bot.access_token = access_token;
    bot.status = 0;
    await matrixBotAccountMapper.updateStatusAndAccessToken(bot.id, access_token, 0);
  }

  //实例话机器人
  try {
    let login_res = await matrix.client(bot);
    if (login_res) {
      let {access_token, refresh_token, device_id, expires_in_ms} = login_res;
      await matrixBotAccountMapper.updateAccessToken(bot.id, access_token, refresh_token, device_id, expires_in_ms);
    }
  } catch (e) {
    console.log(e)
    return;
  }

  //如果需要更新profile
  if (bot.update_profile) {
    await matrix.setProfile(bot, bot.display_name, bot.avatar_url)
    await matrixBotAccountMapper.updateUpdateProfile(bot.id, 0)
  }
  if (bot.status == 1) {
    //如果是1，就启用监听了
    await matrix.start(bot, callback);
  }
}

async function coreProcessor(localpart) {
  let bot = await matrixBotAccountMapper.getByLocalpart(localpart);
  let processor = [];
  if (!bot || !bot.config || !bot.config.processor) return processor;
  for (let pro of bot.config.processor) {
    if (pro == "user") processor.push(userProcessor);
    if (pro == "help") processor.push(helpProcessor);
    if (pro == "member") processor.push(memberProcessor);
    if (pro == "task") processor.push(taskProcessor);
    if (pro == "qa") processor.push(qaProcessor);
    if (pro == "info") processor.push(infoProcessor);
  }
  return processor;
}

async function callback(bot, room_id, room_type, sender, ques) {
  let {msg} = ques;
  msg = msg.trim();
  if (msg.length >= 1024) {
    return 'Your question is too long, please make it shorter.';
  }
  let chat = {
    localpart: bot.localpart,
    room_id: room_id,
    user_id: sender,
    room_type: room_type,
    question: JSON.stringify(ques)
  };
  let insert_id = await matrixBotChatMapper.insert(chat);


  let processorList = await coreProcessor(bot.localpart);
  let res;
  for (let processor of processorList) {
    res = await processor.handle(bot, room_id, sender, ques);
    if (res) break;
  }
  await matrixBotChatMapper.updateAnswer(insert_id, JSON.stringify(res));
  return res;
}


module.exports = {main}
