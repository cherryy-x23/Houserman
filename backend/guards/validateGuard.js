const { body, validationResult } = require('express-validator');

const checkInput = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      ok: false,
      msg: result.array()[0].msg,
      issues: result.array(),
    });
  }
  next();
};

const signupRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 60 }),
  body('emailAddress').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  body('passwordHash').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password too short'),
  body('accountType').optional().isIn(['seeker', 'owner']).withMessage('Invalid account type'),
  body('contactNumber').optional().matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
  checkInput,
];

const signinRules = [
  body('emailAddress').trim().notEmpty().withMessage('Email is required').isEmail(),
  body('passwordHash').notEmpty().withMessage('Password is required'),
  checkInput,
];

const forgotRules = [
  body('emailAddress').trim().notEmpty().withMessage('Email is required').isEmail(),
  checkInput,
];

const resetRules = [
  body('passwordHash').notEmpty().withMessage('Password is required').isLength({ min: 6 }),
  checkInput,
];

const listingRules = [
  body('heading').trim().notEmpty().withMessage('Heading is required').isLength({ max: 100 }),
  body('summary').trim().notEmpty().withMessage('Summary is required').isLength({ max: 2000 }),
  body('category').notEmpty().isIn(['Flat', 'Independent House', 'Bungalow', 'Single Room']),
  body('monthlyCost').notEmpty().isNumeric().custom((v) => v >= 0),
  body('bedroomCount').notEmpty().isInt({ min: 0 }),
  body('bathroomCount').notEmpty().isInt({ min: 0 }),
  body('floorArea').notEmpty().isNumeric().custom((v) => v > 0),
  body('furnishLevel').notEmpty().isIn(['Fully Furnished', 'Partly Furnished', 'Not Furnished']),
  body('readyFrom').notEmpty().isISO8601(),
  checkInput,
];

const stayRules = [
  body('moveInOn').notEmpty().isISO8601().withMessage('Move-in date required'),
  body('moveOutOn').notEmpty().isISO8601().withMessage('Move-out date required'),
  checkInput,
];

const chatRules = [
  body('text').trim().notEmpty().withMessage('Message text required').isLength({ max: 1000 }),
  body('toUser').notEmpty().isMongoId(),
  body('threadTag').notEmpty(),
  checkInput,
];

module.exports = {
  signupRules, signinRules, forgotRules, resetRules,
  listingRules, stayRules, chatRules,
};
