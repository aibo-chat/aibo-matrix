const matrixBotRoomUserMapper = require("../dao/matrix-bot-room-user-mapper");
/**
 * 根据配置，存储消息
 */

module.exports = {
  saveRoomUser: async function (bot, room_id, event, isDm) {
    let item = {
      localpart: bot.localpart,
      room_id: room_id,
      user_id: event.sender,
      room_type: isDm ? 'direct' : 'group'
    }
    //保存聊天信息
    await matrixBotRoomUserMapper.save(item)
  }
}
