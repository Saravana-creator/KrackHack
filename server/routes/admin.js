const express = require('express');
const { 
    addAllowedDomain, 
    getAllowedDomains, 
    deleteAllowedDomain,
    getAdminStats,
    getAllUsers,
    updateUser
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');
const ROLES = require('../constants/roles');

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUser);

router.route('/domains')
    .get(getAllowedDomains)
    .post(addAllowedDomain);

router.route('/domains/:id')
    .delete(deleteAllowedDomain);

module.exports = router;
