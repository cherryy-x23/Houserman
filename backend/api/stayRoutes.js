const express = require('express');
const router = express.Router();
const {
  makeStay, fetchMyStays, fetchOwnerStays, changeStayState, dropStay,
} = require('../handlers/stayHandler');
const { requireLogin, allowOnly } = require('../guards/authGuard');
const { stayRules } = require('../guards/validateGuard');

router.post('/:listingId', requireLogin, allowOnly('seeker'), stayRules, makeStay);
router.get('/my', requireLogin, allowOnly('seeker'), fetchMyStays);
router.get('/owner', requireLogin, allowOnly('owner'), fetchOwnerStays);
router.put('/:id/state', requireLogin, allowOnly('owner', 'manager'), changeStayState);
router.put('/:id/drop', requireLogin, allowOnly('seeker'), dropStay);

module.exports = router;
