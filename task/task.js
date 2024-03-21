const matrixBotTaskMapper = require('./../dao/matrix-bot-task-mapper');
const matrixBotSendMessageMapper = require('./../dao/matrix-bot-send-message-mapper');
const cron = require('node-cron');
const {sendMessage} = require("./send-message-task")
const {migrateUser} = require("./migrate-user-task")
const {formatNow} = require("../util/utils");


let TASKS = {};

async function main() {
  let tasks = await matrixBotTaskMapper.list();
  if (!tasks) return;
  for (let task of tasks) {
    if (!cron.validate(task.cron)) continue;
    console.log("init task:" + JSON.stringify(task))
    let t = cron.schedule(task.cron, async function () {
      await execute(task);
    }, {runOnInit: !!task.init_run})
    TASKS[task.id] = t;
  }
}


async function execute(task) {
  task = JSON.parse(task.content);
  if (task.type == "send_message") {
    console.log("execute task: " + JSON.stringify(task));
    await sendMessage();
  } else if (task.type == "print_log") {
    console.log("execute task: " + JSON.stringify(task))
  } else if (task.type == "migrate_user") {
    console.log("execute task: " + JSON.stringify(task));
    let time;
    if (task.last_day) {
      time = new Date(Date.now() - task.last_day * 24 * 60 * 60 * 1000);
    }
    console.log(`migrate user from ${formatNow(time)} to now`)
    await migrateUser(time);
  } else {
    console.log("nonsupport task type")
  }
}


module.exports = {main}
