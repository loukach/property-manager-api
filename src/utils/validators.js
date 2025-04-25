const { body, validationResult } = require('express-validator');

// Middleware to validate user registration data
const userValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  // Process validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Middleware to validate property data
const propertyValidation = [
  body('name').trim().notEmpty().withMessage('Property name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('property_type').trim().notEmpty().withMessage('Property type is required'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['available', 'occupied', 'under_maintenance'])
    .withMessage('Status must be available, occupied, or under_maintenance'),
  body('monthly_rent')
    .optional()
    .isNumeric()
    .withMessage('Monthly rent must be a number'),
  
  // Process validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Middleware to validate contract data
const contractValidation = [
  body('property_id').trim().notEmpty().withMessage('Property ID is required'),
  body('tenant_name').trim().notEmpty().withMessage('Tenant name is required'),
  body('start_date')
    .trim()
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('end_date')
    .trim()
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      // Check if end date is after start date
      const startDate = new Date(req.body.start_date);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('monthly_rent')
    .notEmpty()
    .withMessage('Monthly rent is required')
    .isNumeric()
    .withMessage('Monthly rent must be a number'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'terminated', 'expired'])
    .withMessage('Status must be active, terminated, or expired'),
  
  // Process validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  userValidation,
  propertyValidation,
  contractValidation
};