var express = require('express');
var router = express.Router();
var cors = require('cors')
var ChatboxController = require('../controllers/chatbox');

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.get('/webhook',cors(corsOptions),ChatboxController.webhookGet);
router.post('/webhook',cors(corsOptions),ChatboxController.webhookPost);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
