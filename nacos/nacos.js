const NacosNamingClient = require('nacos').NacosNamingClient;
const NacosConfigClient = require('nacos').NacosConfigClient;
const {address} = require('ip')
const APPLICATION_NAME = process.env.APPLICATION_NAME
const SERVER_ADDR = process.env.NACOS_CONFIG_SERVER_ADDR;
const USERNAME = process.env.NACOS_CONFIG_USERNAME
const PASSWORD = process.env.NACOS_CONFIG_PASSWORD;
const NAMESPACE = process.env.NACOS_CONFIG_NAMESPACE


async function nacos() {
  //由于aibo没有nacos，所以不需要注册
  // await register()
  // await config()
}

async function register() {
  const client = new NacosNamingClient({
    logger: console,
    serverList: SERVER_ADDR, // replace to real nacos serverList
    namespace: NAMESPACE,
    username: USERNAME,
    password: PASSWORD
  });
  await client.ready();
  const ipAddr = address();
  await client.registerInstance(APPLICATION_NAME, {ip: ipAddr, port: process.env.PORT});
}

async function config() {
  const configClient = new NacosConfigClient({
    serverAddr: SERVER_ADDR, // replace to real nacos serverList
    namespace: NAMESPACE,
    username: USERNAME,
    password: PASSWORD,
    requestTimeout: 6000,
  });
  const data_ids = process.env.NACOS_CONFIG_DATA_IDS.split(",");
  for (let dataId of data_ids) {
    const content = await configClient.getConfig(dataId, 'DEFAULT_GROUP');
    if (!content) continue;
    let lines = content.split("\n");
    for (let line of lines) {
      let end = line.indexOf('#');
      if (end >= 0) {
        line = line.substring(0, end);
      }
      line = line.trim();
      if (!line || line.startsWith("#")) continue
      let arr = line.split("=", 2);
      if (arr.length != 2) continue;
      if (process.env[arr[0]]) continue;
      process.env[arr[0]] = arr[1];
      console.log("增加配置到env:" + arr[0] + "  " + arr[1]);
    }
  }
  console.log(process.env);
}

module.exports = nacos

