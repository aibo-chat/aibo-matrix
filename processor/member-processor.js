const matrix = require("../matrix/matrix")
let HOME_SERVER = process.env.MATRIX_HOME_SERVER;

async function handle(bot, room_id, sender, ques) {
  let {msg} = ques;
  let m;
  if (m = msg.match(/\/invite\s+(\w+)/)) {
    let localpart = m[1];
    try {
      let res = await matrix.inviteUser(bot, room_id, `@${localpart}:${HOME_SERVER}`)
      if (res) return res;
    } catch (e) {
      console.log(e);
      return "Invite user error, possible reason, this user does not exist or the bot does not have permission to invite"
    }
    return "Invitation successful";
  } else if (m = msg.match(/\/kick\s+(\w+)/)) {
    let localpart = m[1];
    try {
      let res = await matrix.kickUser(bot, room_id, `@${localpart}:${HOME_SERVER}`)
      if (res) return res;
    } catch (e) {
      console.log(e);
      return "Kick user error, possible reason, this user does not exist or the bot does not have permission to kick"
    }
    return "Kick successful";
  } else if (m = msg.match(/\/at\s+(\w+)\s+(\w+)/)) {
    let localpart = m[1];
    let question = m[2];
    //sender消息发送者，call呼叫那个机器人
    return {msgtype: "d.call", body: question, sender: sender, call: localpart}
  }
}

module.exports = {handle}

