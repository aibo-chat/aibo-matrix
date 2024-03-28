var express = require('express');
var router = express.Router();
var matrixKeyService = require("../service/matrix-key-service");
/* GET users listing. */
router.post('/saveSecurityKey', async function (req, res, next) {
  matrixKeyService.saveSecurityKey(req)
    .then(body => {
      res.json(body);
    }).catch(err => {
    next(err);
  })
});

router.post('/getSecurityKey', async function (req, res, next) {
  matrixKeyService.getSecurityKey(req)
    .then(body => {
      res.json(body);
    }).catch(err => {
    next(err);
  })
});

router.post('/saveSessionKey', async function (req, res, next) {
  matrixKeyService.saveSessionKey(req)
    .then(body => {
      res.json(body);
    }).catch(err => {
    next(err);
  })
});

router.post('/listSessionKey', async function (req, res, next) {
  matrixKeyService.listSessionKey(req)
    .then(body => {
      res.json(body);
    }).catch(err => {
    next(err);
  })
});

module.exports = router;
