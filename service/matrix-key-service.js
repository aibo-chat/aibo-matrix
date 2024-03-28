const axios = require("axios");
const matrixSecurityKeyMapper = require("../dao/matrix-security-key-mapper")
const matrixRoomKeyMapper = require("../dao/matrix-room-key-mapper")

async function saveSecurityKey(req) {
  let {security_key} = req.body;
  let {user_id} = req.user;
  await matrixSecurityKeyMapper.insert(user_id, security_key);
  return {code: 0, data: true}
}

async function getSecurityKey(req) {
  let {user_id} = req.user;
  let data = await matrixSecurityKeyMapper.getByUserId(user_id);
  return {code: 0, data: data}
}

async function saveSessionKey(req) {
  let {sessions, time} = req.body;
  let {user_id} = req.user;
  if (Array.isArray(sessions)) {
    for (let s of sessions) {
      let {room_id, session_id, session_key} = s;
      if (!room_id || !session_id || !session_key) continue;
      await matrixRoomKeyMapper.save({user_id, room_id, session_id, session_key})
    }
  }
  time = new Date(time ? new Date(time) : new Date(0));
  let data = await matrixRoomKeyMapper.list(user_id, time);
  return {code: 0, data}
}

async function listSessionKey(req) {
  let {time} = req.body;
  let {user_id} = req.user;
  time = new Date(time ? new Date(time) : new Date(0));
  let data = await matrixRoomKeyMapper.list(user_id, time);
  return {code: 0, data}
}

module.exports = {saveSecurityKey, getSecurityKey, saveSessionKey, listSessionKey}
