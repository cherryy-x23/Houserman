const express = require('express');
const router = express.Router();
const { fetchAlerts, clearAlerts } = require('../handlers/socialHandler');
const { requireLogin } = require('../guards/authGuard');

router.get('/', requireLogin, fetchAlerts);
router.put('/clear-all', requireLogin, clearAlerts);

module.exports = router;
