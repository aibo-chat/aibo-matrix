const processorUtils = require('./processor-utils')

async function handle(bot, room_id, sender, ques) {
  let {msg} = ques;
  if (msg.startsWith("/help") || msg == 'hello' || msg == 'hi') {
    let arr = await processorUtils.botIntroduction(bot.localpart);
    return arr;
  } else if (msg == "ping") {
    return "Hello, I am the robot " + bot.display_name;
  }
}

module.exports = {handle}

