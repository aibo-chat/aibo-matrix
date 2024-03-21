const matrixBotRoomMessageMapper = require("../dao/matrix-room-message-mapper");
/**
 * 根据配置，存储消息
 */

module.exports = {
  saveMessage: async function (bot, room_id, event, isDm) {
    if (!bot.config?.save_message) return;
    let chat = {
      room_id: room_id,
      user_id: event.sender,
      event_id: event.event_id,
      message: JSON.stringify(event.content)
    }
    //保存聊天信息
    await matrixBotRoomMessageMapper.save(chat)
  }
}
