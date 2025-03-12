const { check, validationResult } = require('express-validator');

const validateUser = [
  check('email').isEmail().withMessage('Invalid email format'),
  check('password').isStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0
  }).withMessage('Password must be at least 8 characters long.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateUser };
