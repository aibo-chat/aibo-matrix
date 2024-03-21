const matrixBotAccountMapper = require("../dao/matrix-bot-account-mapper")
const messageHandle = require("./message-handle")
const roomUserHandle = require("./room-user-handle")
const replayHandle = require("./reply-handle")
const questionHandle = require("./question-handle")

module.exports = {
  handle: async function (bot, client, room_id, event) {
    //TODO 做一个缓存
    let isDm = client.dms.isDm(room_id)
    let room_type = isDm ? "direct" : "group";

    //保存消息
    await messageHandle.saveMessage(bot, room_id, event, isDm);

    //保存房间用户关系
    await roomUserHandle.saveRoomUser(bot, room_id, event, isDm);

    //如果不回复就直接返回
    if (!(await replayHandle.isReply(bot, room_id, event, isDm))) return;

    //解析出相应的问题
    let ques = await questionHandle.question(bot, room_id, event, isDm);
    ques.room_type = room_type;

    return ques;
  }
}
