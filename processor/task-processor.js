const processorUtils = require('./processor-utils');
const matrixBotRoomUserMapper = require('../dao/matrix-bot-room-user-mapper')
let HOME_SERVER = process.env.MATRIX_HOME_SERVER;
const matrix = require('../matrix/matrix');

//解析消息是不是一个任务
async function handle(bot, room_id, sender, ques) {
  let {type} = ques;
  if (type != 'common_transfer') return;
  let {to} = ques;
  let user_id = `@${to}:${HOME_SERVER}`;
  let rooms = await matrixBotRoomUserMapper.listByLocalpartUserIdRoomType(bot.localpart, user_id, "direct")

  let isSuccessSend = false;
  for (let room of rooms) {
    try {
      let dm = await matrix.checkRoomIsDm(bot, room.room_id, user_id);
      if (!dm) continue;
      let head_title = `Hi, you received ${ques.transfer_amount} ${ques.token_symbol} transferred from ${ques.from}`;
      delete ques.type;
      let content = {msgtype: "d.common_transfer", body: {...ques, head_title}}
      await matrix.sendMessage(bot, room.room_id, content)
      isSuccessSend = true;
      break;
    } catch (e) {
      console.log(e);
    }
  }
  if (isSuccessSend) {
    return [];
  } else {
    return "I can't notify them that they haven't established a chat with me";
  }
}

module.exports = {handle}
