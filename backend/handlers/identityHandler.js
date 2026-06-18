const crypto = require('crypto');
const Account = require('../schemas/Account');
const { ServiceError } = require('../guards/errorGuard');
const nodemailer = require('nodemailer');

const dispatchToken = (account, code, res) => {
  const token = account.issueToken();
  account.passwordHash = undefined;
  res.status(code).json({ ok: true, token, account });
};

const mailer = async ({ to, subject, html }) => {
  const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });
  await transport.sendMail({ from: process.env.MAIL_FROM, to, subject, html });
};

exports.signup = async (req, res, next) => {
  try {
    const { fullName, emailAddress, passwordHash, accountType, contactNumber } = req.body;
    const taken = await Account.findOne({ emailAddress });
    if (taken) return next(new ServiceError('This email is already registered', 400));
    const account = await Account.create({
      fullName, emailAddress, passwordHash,
      accountType: accountType || 'seeker', contactNumber,
    });
    res.status(201).json({ ok: true, msg: 'Account created. Please sign in.', account: { emailAddress: account.emailAddress } });
  } catch (e) { next(e); }
};

exports.signin = async (req, res, next) => {
  try {
    const { emailAddress, passwordHash } = req.body;
    const account = await Account.findOne({ emailAddress }).select('+passwordHash');
    if (!account) return next(new ServiceError('Wrong email or password', 401));
    if (account.suspended) return next(new ServiceError('Your account is suspended', 403));
    const matched = await account.verifyPassword(passwordHash);
    if (!matched) return next(new ServiceError('Wrong email or password', 401));
    account.lastSeen = new Date();
    await account.save({ validateBeforeSave: false });
    dispatchToken(account, 200, res);
  } catch (e) { next(e); }
};

exports.whoAmI = async (req, res, next) => {
  try {
    const account = await Account.findById(req.account.id);
    res.status(200).json({ ok: true, account });
  } catch (e) { next(e); }
};

exports.forgotPasscode = async (req, res, next) => {
  try {
    const account = await Account.findOne({ emailAddress: req.body.emailAddress });
    if (!account) return next(new ServiceError('No account with this email', 404));
    const code = account.generateResetCode();
    await account.save({ validateBeforeSave: false });
    const link = `${process.env.FRONTEND_URL}/reset-passcode/${code}`;
    await mailer({
      to: account.emailAddress,
      subject: 'Reset Your Passcode - HouseRman',
      html: `<h2>Reset Request</h2><p>Click below to reset your passcode. Expires in 10 minutes.</p><a href="${link}">Reset Passcode</a>`,
    });
    res.status(200).json({ ok: true, msg: 'Reset link sent to email' });
  } catch (e) { next(e); }
};

exports.resetPasscode = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.code).digest('hex');
    const account = await Account.findOne({
      passcodeResetToken: hashed,
      passcodeResetExpiry: { $gt: Date.now() },
    });
    if (!account) return next(new ServiceError('Invalid or expired reset link', 400));
    account.passwordHash = req.body.passwordHash;
    account.passcodeResetToken = undefined;
    account.passcodeResetExpiry = undefined;
    await account.save();
    dispatchToken(account, 200, res);
  } catch (e) { next(e); }
};

exports.changePasscode = async (req, res, next) => {
  try {
    const account = await Account.findById(req.account.id).select('+passwordHash');
    const matched = await account.verifyPassword(req.body.currentPasscode);
    if (!matched) return next(new ServiceError('Current passcode is incorrect', 401));
    account.passwordHash = req.body.newPasscode;
    await account.save();
    dispatchToken(account, 200, res);
  } catch (e) { next(e); }
};
