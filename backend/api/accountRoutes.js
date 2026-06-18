const express = require('express');
const router = express.Router();
const {
  editProfile, fetchAccountById, ownerConsole, seekerConsole,
} = require('../handlers/accountHandler');
const { requireLogin, allowOnly } = require('../guards/authGuard');
const { avatarUpload } = require('../configs/fileStorage');

router.put('/profile', requireLogin, avatarUpload, editProfile);
router.get('/console/owner', requireLogin, allowOnly('owner'), ownerConsole);
router.get('/console/seeker', requireLogin, allowOnly('seeker'), seekerConsole);
router.get('/:id', requireLogin, fetchAccountById);

module.exports = router;
