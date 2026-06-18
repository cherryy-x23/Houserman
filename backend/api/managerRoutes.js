const express = require('express');
const router = express.Router();
const {
  managerFigures, managerAccountList, toggleSuspend, managerRemoveListing,
} = require('../handlers/accountHandler');
const Listing = require('../schemas/Listing');
const Account = require('../schemas/Account');
const { Stay } = require('../schemas/extras');
const { requireLogin, allowOnly } = require('../guards/authGuard');

router.use(requireLogin, allowOnly('manager'));

router.get('/figures', managerFigures);
router.get('/accounts', managerAccountList);
router.put('/accounts/:id/suspend', toggleSuspend);
router.delete('/listings/:id', managerRemoveListing);

// Get pending listings
router.get('/listings/pending', async (req, res) => {
  try {
    const listings = await Listing.find({ moderationState: 'Awaiting' })
      .populate('ownerRef', 'fullName emailAddress contactNumber')
      .sort('-createdAt');
    res.json({ ok: true, listings });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// Get all listings (any moderation state)
router.get('/listings', async (req, res) => {
  try {
    const { moderationState } = req.query;
    const filter = moderationState ? { moderationState } : {};
    const listings = await Listing.find(filter)
      .populate('ownerRef', 'fullName emailAddress')
      .sort('-createdAt');
    res.json({ ok: true, listings });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// Clear or reject a listing
router.put('/listings/:id/moderate', async (req, res) => {
  try {
    const { moderationState, moderationNote } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { moderationState, moderationNote },
      { new: true }
    ).populate('ownerRef', 'fullName emailAddress');
    if (!listing) return res.status(404).json({ ok: false, msg: 'Listing not found' });
    res.json({ ok: true, listing });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// Get all stays
router.get('/stays', async (req, res) => {
  try {
    const stays = await Stay.find()
      .populate('listingRef', 'heading locationInfo')
      .populate('seekerRef', 'fullName emailAddress')
      .populate('ownerRef', 'fullName emailAddress')
      .sort('-createdAt');
    res.json({ ok: true, stays });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

module.exports = router;
