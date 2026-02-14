const express = require('express');
const {
    getItems,
    createItem,
    getItem,
    updateItem,
    deleteItem,
    claimItem
} = require('../controllers/lostFoundController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getItems)
    .post(createItem);

router
    .route('/:id')
    .get(getItem)
    .put(updateItem)
    .delete(deleteItem);

router
    .route('/:id/claim')
    .post(claimItem);

module.exports = router;
