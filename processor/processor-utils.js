const matrixBotAccountMapper = require("../dao/matrix-bot-account-mapper");
const {tryJson} = require("../util/utils");
const aiBot = require("../vender/defed-ai");
const matrixBotRoomMapper = require("../dao/matrix-bot-room-mapper");
const matrixBotUserMapper = require("../dao/matrix-bot-user-mapper");
const utils = require("../util/utils");


module.exports = {
  getUser: async function (localpart, user_id) {
    let user = await matrixBotUserMapper.getUser(localpart, user_id);
    const current_date = utils.formatNow("YYYY-MM-DD");
    if (user.call_date != current_date) {
      user.call_date = current_date;
      user.call_count = 0;
    }
    return user;
  },
  createChatId: async function (localpart, room_id) {
    let matrixBotRoom = await matrixBotRoomMapper.getByLocalpartAndRoomId(localpart, room_id);
    let chat_id;
    if (!matrixBotRoom) {
      let res = await aiBot.createChat(room_id);
      chat_id = res.data.chatId;
      if (!chat_id) {
        throw new {msg: "Create chat id error"}
      }
      await matrixBotRoomMapper.insert(localpart, room_id, chat_id)
    } else {
      chat_id = matrixBotRoom.chat_id;
    }
    return chat_id;
  },
  botIntroduction: async function (localpart) {
    let bot = await matrixBotAccountMapper.getByLocalpart(localpart);
    if (!bot) return "Query bot error";
    let intros = bot.introduction.split("---");
    let arr = []
    for (let intro of intros) {
      arr.push({"body": intro, "msgtype": "m.text"})
    }
    if (bot.question_template) {
      arr.push({"body": bot.question_template, "msgtype": "d.question_template"})
    }
    return arr;
  }
}
