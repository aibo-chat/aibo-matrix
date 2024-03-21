const log4js = require('log4js');
let config = require('./../log4js.json')
config.appenders.file.filename = process.env.LOGGER_PATH
log4js.configure(config); // 加载配置文件

const logger = log4js.getLogger(); // 获取默认的 logger

if (process.env.NODE_ENV != 'dev') {
  console = logger;
}
