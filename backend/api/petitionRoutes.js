const express = require('express');
const router = express.Router();
const {
  makePetition, fetchMyPetitions, fetchOwnerPetitions, changePetitionState,
} = require('../handlers/socialHandler');
const { requireLogin, allowOnly } = require('../guards/authGuard');

router.post('/:listingId', requireLogin, allowOnly('seeker'), makePetition);
router.get('/my', requireLogin, allowOnly('seeker'), fetchMyPetitions);
router.get('/owner', requireLogin, allowOnly('owner'), fetchOwnerPetitions);
router.put('/:id/state', requireLogin, allowOnly('owner'), changePetitionState);

module.exports = router;
