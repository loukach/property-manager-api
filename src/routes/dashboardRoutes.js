const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getDashboardSummary } = require('../controllers/dashboardController');

const router = express.Router();

// MVP: Authentication disabled for now
// router.use(authenticateToken);

// Dashboard routes
router.get('/summary', getDashboardSummary);

module.exports = router;