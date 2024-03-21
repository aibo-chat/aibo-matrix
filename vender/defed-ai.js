const axios = require('axios');
const HOST = process.env.AI_HOST;
const TOKEN = process.env.AI_TOKEN;


module.exports = {
  /**
   * 创建一个聊天窗口
   */
  createChat: async function (user_id) {
    const url = HOST + '/createChat';
    const headers = {
      'Authorization': TOKEN,
      'Content-Type': 'application/json'
    };
    const data = {
      userId: user_id
    };
    const response = await axios.post(url, data, {headers: headers, timeout: 2 * 60 * 1000});
    return response.data;
  },

  chat: async function (chat_id, user_id, msg, type) {
    const url = HOST + '/defed/chat';
    const headers = {
      'Authorization': TOKEN,
      'Content-Type': 'application/json'
    };
    let data = {
      "chatId": chat_id,
      "userId": user_id,
      "canSave": true,
      "question": msg,
      "longModel": true,
      "roundId": 0,
      "questionType": type
    };

    const response = await axios.post(url, data, {headers: headers, timeout: 2 * 60 * 1000});
    return response.data;
  },

  preset: async function (chat_id, user_id, msg, type, tokens = []) {
    const url = HOST + '/defed/preset';
    const headers = {
      'Authorization': TOKEN,
      'Content-Type': 'application/json'
    };
    let data = {
      "presetType": type,
      "chatId": chat_id,
      "userId": user_id,
      "canSave": true,
      "question": msg,
      "longModel": true,
      "roundId": 0,
      "tokens": tokens
    };

    const response = await axios.post(url, data, {headers: headers, timeout: 2 * 60 * 1000});
    return response.data;
  }

}

