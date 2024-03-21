const {MessageEvent} = require("matrix-bot-sdk");
/**
 * 判断消息是否需要回复
 */

module.exports = {
  isReply: async function (bot, room_id, event, isDm) {
    const event_wrap = new MessageEvent(event);
    let {body, msgtype, ask_id, ask_type, call} = event.content;
    //如果房间类型不回复
    if (bot.config.reply_room_type.indexOf(isDm ? "direct" : "group") < 0) return;
    //修改的消息不回复
    if (event_wrap.isRedacted) return;
    //发送者是自己的不回复
    if (event_wrap.sender === await bot.user_id) return;
    //msgtype没配置的不回复
    if (bot.config.reply_msg_type.indexOf(msgtype) < 0) return; // Ignore non-text messages


    if (msgtype == "m.text") {
      //如果是单聊需要回复,如果是对回复的追问需要回复,如果@了机器人需要回复
      let reply = (isDm) || (ask_id || ask_type) || (body?.indexOf(bot.user_id) >= 0)
      return reply;
    }
    if (msgtype == 'd.call') {
      //如果调用者是自己
      return bot.localpart == call;
    }
    //如果是转账消息，且有sender_id和receiver_id了
    if (msgtype == "d.common_transfer" && body.tx_status==0) {
      return true;
    }
  }
}
