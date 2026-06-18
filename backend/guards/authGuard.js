const jwt = require('jsonwebtoken');
const Account = require('../schemas/Account');

exports.requireLogin = async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.toLowerCase().startsWith('bearer ')) {
    token = header.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ ok: false, msg: 'Access denied, no token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const account = await Account.findById(decoded.id);
    if (!account) return res.status(401).json({ ok: false, msg: 'Account not found' });
    if (account.suspended) return res.status(403).json({ ok: false, msg: 'Your account has been suspended' });
    req.account = account;
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, msg: 'Invalid or expired token' });
  }
};

exports.allowOnly = (...types) => (req, res, next) => {
  if (!types.includes(req.account.accountType)) {
    return res.status(403).json({
      ok: false,
      msg: `Account type '${req.account.accountType}' cannot access this resource`,
    });
  }
  next();
};
