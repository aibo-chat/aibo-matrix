const matrixBotSendMessageMapper = require("../dao/matrix-bot-send-message-mapper");
const matrixBotAccountMapper = require("../dao/matrix-bot-account-mapper");
const matrix = require("../matrix/matrix");

module.exports = {
  sendMessage: async function () {
    let messages = await matrixBotSendMessageMapper.queryTodoMessage();
    if (!messages) return;
    for (let msg of messages) {
      let res = await matrix.sendMessage(msg.localpart, msg.room_id, JSON.parse(msg.message));
      await matrixBotSendMessageMapper.updateMessage(msg.id, res ? 1 : -1, res ? "success" : "fail");
    }
  }
}

