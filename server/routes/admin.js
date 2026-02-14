const express = require('express');
const { addAllowedDomain, getAllowedDomains, deleteAllowedDomain } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/domains')
    .get(getAllowedDomains)
    .post(addAllowedDomain);

router.route('/domains/:id')
    .delete(deleteAllowedDomain);

module.exports = router;
