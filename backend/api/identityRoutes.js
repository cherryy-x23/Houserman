const express = require('express');
const router = express.Router();
const {
  signup, signin, whoAmI, forgotPasscode, resetPasscode, changePasscode,
} = require('../handlers/identityHandler');
const { requireLogin } = require('../guards/authGuard');
const { signupRules, signinRules, forgotRules, resetRules } = require('../guards/validateGuard');

router.post('/signup', signupRules, signup);
router.post('/signin', signinRules, signin);
router.get('/me', requireLogin, whoAmI);
router.post('/forgot-passcode', forgotRules, forgotPasscode);
router.put('/reset-passcode/:code', resetRules, resetPasscode);
router.put('/change-passcode', requireLogin, changePasscode);

module.exports = router;
