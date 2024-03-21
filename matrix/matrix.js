const {
  MatrixAuth, MatrixClient, MessageEvent, SimpleFsStorageProvider, RustSdkCryptoStorageProvider,
  LogService, RichConsoleLogger, LogLevel
} = require("matrix-bot-sdk")
const fs = require('fs-extra');
const endeUtils = require("../util/ende-utils")
const {formatNow, tryJson} = require("../util/utils")
const matrixBotRoomMessageMapper = require("../dao/matrix-room-message-mapper")
const coreHandle = require("../handle/core-handle")
LogService.setLogger(new RichConsoleLogger());
const HOME_SERVER_URL = process.env.MATRIX_HOME_SERVER_URL;
const DATA_PATH = process.env.DATA_STORE_PATH;
const env = process.env.NODE_ENV;
if (!HOME_SERVER_URL) throw {code: 0, msg: "Home server not exists"}
const CLIENTS = {}

/**
 * 注册matrix账号
 */
async function register(localpart, password) {
  let auth = new MatrixAuth(HOME_SERVER_URL);
  let client = await auth.passwordRegister(localpart, password);
  console.log("Copy this access token to your bot's config: ", client.accessToken);
  return client.accessToken;
}

/**
 * 重写MatrixClient的密码登录方法
 */
async function _passwordLogin(localpart, password, session, deviceName) {
  const body = {
    type: "m.login.password",
    identifier: {
      type: "m.id.user",
      user: localpart,
    },
    refresh_token: true,
    password: password,
    session: session,
    initial_device_display_name: deviceName,
  };

  const response = await this.createTemplateClient().doRequest("POST", "/_matrix/client/v3/login", null, body);
  const access_token = response["access_token"];
  const refresh_token = response["refresh_token"];
  const device_id = response["device_id"];
  let expires_in_ms = response["expires_in_ms"];
  if (!access_token || !device_id || !expires_in_ms || !refresh_token) throw new Error("Expected access token in response - got nothing");

  expires_in_ms += Date.now();
  return {access_token, device_id, expires_in_ms, refresh_token}
}

/**
 * 为MatrixClient增加刷新方法
 */
async function _refreshToken(refresh_token) {
  const body = {
    refresh_token: refresh_token
  };

  const response = await this.createTemplateClient().doRequest("POST", "/_matrix/client/v3/refresh", null, body);
  const access_token = response["access_token"];
  refresh_token = response["refresh_token"];
  let expires_in_ms = response["expires_in_ms"];
  if (!access_token || !expires_in_ms || !refresh_token) throw new Error("Expected refresh token in response - got nothing");

  expires_in_ms += Date.now();
  return {access_token, expires_in_ms, refresh_token}
}

/**
 * 为MatrixClient增加刷新方法
 */
async function _adminRegisterUser(user_id, display_name, avatar_url, external_ids) {
  const body = {
    displayname: display_name,
    avatar_url: avatar_url,
    external_ids: external_ids
  };
  const endpoint = '/_synapse/admin/v2/users/' + encodeURIComponent(user_id);
  const response = await this.doRequest("PUT", endpoint, null, body);
  return response;
}

/**
 * 账号密码登录接口
 */
async function login(localpart, password) {
  let auth = new MatrixAuth(HOME_SERVER_URL);
  auth.passwordLogin = _passwordLogin;
  let session = endeUtils.hash("session_" + localpart + password).substring(0, 16);
  let res = await auth.passwordLogin(localpart, password, session, localpart);
  console.log("Copy this access token to your bot's config: ", res);
  return res;
}

/**
 * 刷新token
 */
async function refreshToken(localpart, refresh_token) {
  let auth = new MatrixAuth(HOME_SERVER_URL);
  auth.refreshToken = _refreshToken
  let res = await auth.refreshToken(refresh_token);
  console.log("Copy this access token to your bot's config: ", res);
  let client = CLIENTS[localpart];
  if (client) {
    client.accessToken = res.access_token;
  }
  return res;
}

/**
 * 设置显示名字和头像
 */
async function setProfile(bot, display_name, avatar_url) {
  let client = CLIENTS[bot.localpart];
  if (display_name) {
    await client.setDisplayName(display_name);
  }
  if (avatar_url) {
    let mxc_url = await client.uploadContentFromUrl(avatar_url);
    await client.setAvatarUrl(mxc_url);
  }
}

/**
 * 邀请用户
 */
async function inviteUser(bot, room_id, user_id) {
  let client = CLIENTS[bot.localpart];
  let res = await client.getUserProfile(user_id)
  let users = await client.getJoinedRoomMembers(room_id);
  if (users.indexOf(user_id) >= 0) return "The user is already in the room"
  res = await client.inviteUser(user_id, room_id)
  return;
}

/**
 * 踢掉用户
 */
async function kickUser(bot, room_id, user_id) {
  let client = CLIENTS[bot.localpart];
  let users = await client.getJoinedRoomMembers(room_id);
  if (users.indexOf(user_id) <= 0) return "This user is not in this room"
  let res = await client.kickUser(user_id, room_id)
  return;
}

async function uploadContentFromUrl(localpart, url) {
  let client = CLIENTS[localpart];
  let mac = await client.uploadContentFromUrl(url);
  return mac;
}

async function adminRegisterUser(localpart, user_id, display_name, avatar_url, external_ids) {
  let client = CLIENTS[localpart];
  client.adminRegisterUser = _adminRegisterUser;
  let res = await client.adminRegisterUser(user_id, display_name, avatar_url, external_ids);
  return res;
}

/**
 * 更具bot，创建MatrixClient
 */
async function client(bot) {
  if (CLIENTS[bot.localpart]) return;
  let file = DATA_PATH + "/" + bot.localpart + "/" + "bot_" + bot.localpart + ".json";
  let fold = DATA_PATH + "/" + bot.localpart + "/crypto";
  let client;
  let login_res;
  try {
    let storage = new SimpleFsStorageProvider(file);
    let cryptoProvider = new RustSdkCryptoStorageProvider(fold);
    client = new MatrixClient(HOME_SERVER_URL, bot.access_token, storage, cryptoProvider);
    let res = await client.getWhoAmI();
    console.log("whoami: " + JSON.stringify(res));
    CLIENTS[bot.localpart] = client;
  } catch (e) {
    console.log(bot.localpart, e)
    //删除文件
    await fs.removeSync(fold);
    // TODO SimpleFsStorageProvider这个文件是否也需要删除，需要验证
    console.log("access token invalid, delete crypto fold:" + fold);
    login_res = await login(bot.localpart, bot.password);
    let storage = new SimpleFsStorageProvider(file);
    let cryptoProvider = new RustSdkCryptoStorageProvider(fold);
    client = new MatrixClient(HOME_SERVER_URL, login_res.access_token, storage, cryptoProvider);
    CLIENTS[bot.localpart] = client;
  }
  LogService.setLogger(new RichConsoleLogger());
  if (env != "prod") LogService.setLevel(LogLevel.DEBUG);
  return login_res;
}

/**
 * 启动机器人
 */
async function start(bot, cb) {
  let client = CLIENTS[bot.localpart]
  if (!client) {
    console.error("client not exists, localpart:" + bot.localpart)
    return;
  }
  client.on("room.invite", (room_id, event) => onInvite(bot, client, room_id, event));
  client.on("room.join", (room_id, event) => onJoin(bot, client, room_id, event));
  client.on("room.leave", (room_id, event) => onLeave(bot, client, room_id, event));
  client.on("room.message", (room_id, event) => onMessage(bot, client, room_id, event, cb));
  client.on("room.event", (room_id, event) => onEvent(bot, client, room_id, event));
  client.on("room.encrypted_event", (room_id, event) => onEncryptedEvent(bot, client, room_id, event));
  client.on("room.decrypted_event", (room_id, event) => onDecryptedEvent(bot, client, room_id, event));
  client.on("room.failed_decryption", (room_id, event, error) => onFailedDecryption(bot, client, room_id, event, error));
  client.start().then(() => console.log("Bot " + bot.user_id + " started!")).catch((err) => {
    console.log(err);
  })
}

/**
 * 当有room邀请机器人的时候
 */
async function onInvite(bot, client, room_id, event) {
  console.log("-----------onInvite-----------", room_id, event);
  let isDm = client.dms.isDm(room_id)
  if (bot.reply_room_types.indexOf(isDm ? "direct" : "group") < 0) return;

  try {
    await client.joinRoom(room_id);
  } catch (e) {
    console.log(`bot ${bot.localpart} join room ${room_id} fail`)
    console.log(e);
    return;
  }
  let intros = bot.introduction.split("---");
  for (let intro of intros) {
    await client.sendMessage(room_id, {"body": intro, "msgtype": "m.text"});
  }
  if (bot.question_template) {
    await client.sendMessage(room_id, {"body": bot.question_template, "msgtype": "d.question_template"});
  }
}

/**
 * 当有其他用户加入群聊的时候
 */
async function onJoin(bot, client, room_id, event) {
  console.log("-----------onJoin-----------", room_id, event);
}

/**
 * 当有成员离开room的时候
 */
async function onLeave(bot, client, room_id, event) {
  console.log("-----------onLeave-----------", room_id, event);
  let isDm = client.dms.isDm(room_id)
  if (!isDm) return;
  await client.leaveRoom(room_id);
  console.log("bot:" + bot.localpart + " leave room:" + room_id)
}


async function onEvent(bot, client, room_id, event) {
  // console.log("-----------onEvent-----------", room_id, event);
}

async function onEncryptedEvent(bot, client, room_id, event) {
  // console.log("-----------onEncryptedEvent-----------", room_id, event);
}

async function onDecryptedEvent(bot, client, room_id, event) {
  // console.log("-----------onDecryptedEvent-----------", room_id, event);
}

async function onFailedDecryption(bot, client, room_id, event, error) {
  console.log("-----------onFailedDecryption-----------", room_id, event, error);
  // if (process.env.NODE_ENV == 'prod' || bot.username == event.sender) return;
  // await reply(client, room_id, null, false, "failed decryption")
}

async function sendMessage(localpart, room_id, msg) {
  let client = CLIENTS[localpart];
  if (!client) return false;
  await send(client, room_id, msg);
  return true;
}

//记录是否在回复这个用户了
let SENDER_REPLY_STATUS = {}

/**
 * 当有新消息过来的时候
 */
async function onMessage(bot, client, room_id, event, cb) {
  let ques = await coreHandle.handle(bot, client, room_id, event);
  if (!ques) return;

  let {sender, room_type, reply_to} = ques;

  let time = formatNow("ssSSS");
  let res = "";
  try {
    if (SENDER_REPLY_STATUS[sender] == true) return;
    console.log(bot.localpart + "-" + time + "<: " + JSON.stringify(ques))
    SENDER_REPLY_STATUS[sender] = true;
    await client.setTyping(room_id, true)
    res = await cb(bot, room_id, room_type, sender, ques);
  } catch (e) {
    console.log(e);
    res = "An error occurred. You can try asking again later";
  }
  delete SENDER_REPLY_STATUS[sender]
  try {
    await client.setTyping(room_id, false).then();
  } catch (e) {
    console.log(e)
  }
  console.log(bot.localpart + "-" + time + ">: " + JSON.stringify(res))
  if (room_type == 'group' && typeof res == 'string') res = {body: res, mention: (reply_to || sender)}
  await send(client, room_id, res);
}

/**
 * text:纯文本回复
 * html:html回复
 * notice:应用消息
 * mention:@发送者
 * content:内容
 */
async function send(client, room_id, res) {
  if (typeof res == 'string') res = {body: res}
  let arr = Array.isArray(res) ? res : [res];
  for (let content of arr) {
    let {body, notice, mention, msgtype} = content;
    if (mention) {
      let html = '<a href="https://matrix.to/#/' + encodeURIComponent(typeof mention == 'boolean' ? sender : mention) + '"></a> ' + body;
      await client.sendHtmlText(room_id, html);
    } else {
      if (msgtype) {
        await client.sendMessage(room_id, content)
      } else {
        await client.sendText(room_id, body)
      }
    }
  }
  return true;
}

/**
 * 检查房间是否是dm,如果是，且用户在里面，就返回true
 */
async function checkRoomIsDm(bot, room_id, user_id) {
  let client = CLIENTS[bot.localpart];
  let users = await client.getJoinedRoomMembers(room_id);
  if (users.indexOf(user_id) < 0) return;
  let isDm = client.dms.isDm(room_id)
  return isDm;
}


async function sendMessage(bot, room_id, res) {
  let client = CLIENTS[bot.localpart];
  await send(client, room_id, res);
}

module.exports = {
  register,
  setProfile,
  client,
  start,
  refreshToken,
  sendMessage,
  uploadContentFromUrl,
  adminRegisterUser,
  inviteUser,
  kickUser,
  checkRoomIsDm,
  sendMessage
};
