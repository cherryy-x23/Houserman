const express = require('express');
const router = express.Router();
const { toggleWishlist, fetchWishlist, checkWishlist } = require('../handlers/socialHandler');
const { requireLogin, allowOnly } = require('../guards/authGuard');

router.get('/', requireLogin, allowOnly('seeker'), fetchWishlist);
router.post('/:listingId', requireLogin, allowOnly('seeker'), toggleWishlist);
router.get('/:listingId/check', requireLogin, allowOnly('seeker'), checkWishlist);

module.exports = router;
