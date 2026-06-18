const express = require('express');
const router = express.Router();
const {
  fetchAllListings, fetchOneListing, makeListing,
  reviseListing, removeListing, removeListingPicture,
} = require('../handlers/listingHandler');
const { requireLogin, allowOnly } = require('../guards/authGuard');
const { houseImageUpload } = require('../configs/fileStorage');
const { listingRules } = require('../guards/validateGuard');

router.get('/', fetchAllListings);
router.get('/:id', fetchOneListing);
router.post('/', requireLogin, allowOnly('owner', 'manager'), houseImageUpload, listingRules, makeListing);
router.put('/:id', requireLogin, allowOnly('owner', 'manager'), houseImageUpload, reviseListing);
router.delete('/:id', requireLogin, allowOnly('owner', 'manager'), removeListing);
router.delete('/:id/pictures/:picId', requireLogin, allowOnly('owner'), removeListingPicture);

module.exports = router;
