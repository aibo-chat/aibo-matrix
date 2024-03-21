var express = require('express');
var router = express.Router();
var matrixBotAccountService = require('../service/matrix-bot-account-service')

/* 获取所有机器人*/
router.get('/bot/list', async function (req, res, next) {
  let body = await matrixBotAccountService.list();
  res.json(body);
});


/**
 * 更新机器人信息
 */
router.get('/bot/updateBotInfo', async function (req, res, next) {
  let body = await matrixBotAccountService.updateBotInfo(req.body);
  res.json(body);
});


module.exports = router;
