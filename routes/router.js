var express = require('express');
var router = express.Router();
var ChatboxController = require('../controllers/chatbox');

router.get('/questions/save', ChatboxController.saveQuestion);
router.get('/questions/relation',ChatboxController.obtainRelationQuestion);
router.get('/questions/obtain/:ids?',ChatboxController.obtainRelationQuestion);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('chatbox');
});

module.exports = router;
