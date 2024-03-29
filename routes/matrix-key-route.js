var express = require('express');
var router = express.Router();
var matrixKeyService = require("../service/matrix-key-service");
/* GET users listing. */
router.post('/key/saveSecurityKey', async function (req, res, next) {
  let body = await matrixKeyService.saveSecurityKey(req);
  res.json(body)
});

router.get('/key/getSecurityKey', async function (req, res, next) {
  let body = await matrixKeyService.getSecurityKey(req);
  res.json(body);
});

router.post('/key/saveSessionKey', async function (req, res, next) {
  let body = await matrixKeyService.saveSessionKey(req);
  res.json(body);
});

router.get('/key/listSessionKey', async function (req, res, next) {
  let body = await matrixKeyService.listSessionKey(req)
  res.json(body);
});

module.exports = router;
