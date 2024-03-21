const defedAi = require("../vender/defed-ai");
const matrixBotUserMapper = require("../dao/matrix-bot-user-mapper");
const processorUtils = require('./processor-utils')


async function helpBot(bot, room_id, sender, ques) {
  let {msg} = ques;
  let chat_id = await processorUtils.createChatId(bot.localpart, room_id);
  try {
    let res = await defedAi.chat(chat_id, room_id, msg, "qa");
    if (!res || !res.data || !res.data.answer) {
      console.log(res);
    }
    if (res.data.action == 'greeting') {
      return await processorUtils.botIntroduction(bot.localpart);
    }
    return res.data.answer;
  } catch (e) {
    console.log(e);
    return "An error occurred. You can try asking again later";
  }
}
async function handle(bot, room_id, sender, ques) {
  let user = await processorUtils.getUser(bot.localpart, sender);
  if (user.call_count++ >= (process.env.AI_CALL_COUNT_PER_DAY || 10)) {
    return `Thank you very much for your interest in me.  However, to answer more people's questions, I have to take a break.  If you have more questions, feel free to ask me again tomorrow.`;
  }
  let res;
  res = await throttles[bot.localpart](async () => {
    let r = await helpBot(bot, room_id, sender, ques);
    await matrixBotUserMapper.updateCallCount(user.id, user.call_date, user.call_count);
    return r;
  }, () => {
    return 'Help bot rate limit exceeded';
  })
  if (res) return res;
  return "The little ones will be here soon, 🏇🏇🏇";
}

module.exports = {handle}
