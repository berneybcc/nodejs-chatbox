var express = require('express');
var router = express.Router();
var cors = require('cors')
var ChatboxController = require('../controllers/chatbox');

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.post('/questions/save',cors(corsOptions), ChatboxController.saveQuestion);
router.post('/questions/updata',cors(corsOptions),ChatboxController.updateQuestion);
router.post('/questions/delete',cors(corsOptions),ChatboxController.deleteQuestion);
router.get('/questions/relation',ChatboxController.obtainRelationQuestion);
router.get('/questions/obtain/:ids?',cors(corsOptions),ChatboxController.obtainRelationQuestion);
router.get('/admin/questions',ChatboxController.adminQuestion);

/* GET users listing. */


module.exports = router;
