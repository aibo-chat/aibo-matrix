const matrixBotRoomMessageMapper = require("../dao/matrix-room-message-mapper");
const handleUtils = require("./handle-utils");
/**
 * 将消息解析成ques
 */
module.exports = {
  question: async function (bot, room_id, event, isDm) {
    // let {msgtype, sender, call} = event.content;
    let sender = event.sender;
    let {msgtype, body} = event.content;
    let {ask_id, ask_type} = event.content;

    //如果是调用自己的
    if (msgtype == 'd.call') {
      //在reply-handle中已经判断是是自己要回复的消息
      let {sender: reply_to} = event.content;
      return {msg: "", sender, reply_to: reply_to}
    }

    if (msgtype == 'd.common_transfer' && body.tx_status == 0) {
      return {msg: "", type: "common_transfer", ...body, sender, reply_to: sender}
    }

    //去掉消息中关于自己的信息
    let msg = body.replaceAll(bot.user_id, '').trim();
    if (!msg) return;

    //如果是针对某个回复提问
    if (ask_id && ask_type) {
      return {msg: `#${ask_type}#${ask_id}#question#${msg}`, sender, reply_to: sender}
    }


    //根据模板，精准解析数据
    let type = handleUtils.matchTemplateType(bot, msg);
    if (type) {
      let tokens = handleUtils.extractTokeSymbol(msg)
      return {type, tokens, msg, sender, reply_to: sender}
    }
    return {msg, sender, reply_to: sender};
  }
}
