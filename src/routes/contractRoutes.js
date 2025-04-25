const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { contractValidation } = require('../utils/validators');
const {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract
} = require('../controllers/contractController');

const router = express.Router();

// MVP: Authentication disabled for now
// router.use(authenticateToken);

// Contract routes
router.get('/', getAllContracts);
router.get('/:id', getContractById);
router.post('/', contractValidation, createContract);
router.put('/:id', contractValidation, updateContract);
router.delete('/:id', deleteContract);

module.exports = router;