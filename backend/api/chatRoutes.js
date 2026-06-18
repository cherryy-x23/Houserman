const express = require('express');
const router = express.Router();
const { sendChatLine, fetchChatLines, fetchThreads } = require('../handlers/socialHandler');
const { requireLogin } = require('../guards/authGuard');
const { chatRules } = require('../guards/validateGuard');

router.get('/threads', requireLogin, fetchThreads);
router.get('/:threadTag', requireLogin, fetchChatLines);
router.post('/', requireLogin, chatRules, sendChatLine);

module.exports = router;
