const { validationResult } = require("express-validator");

// middleware function before user req is saved
exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  // if we get errors
  if (!errors.isEmpty()) {
    // return message of first error in array
    return res.status(422).json({ error: errors.array()[0].msg });
  }
  next();
};
