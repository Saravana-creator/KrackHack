const LostFoundItem = require('../models/LostFoundItem');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');

// @desc      Get all lost & found items
// @route     GET /api/v1/lostfound
// @access    Private
exports.getItems = asyncHandler(async (req, res, next) => {
    let query;

    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = LostFoundItem.find(JSON.parse(queryStr)).populate({
        path: 'postedBy',
        select: 'username email'
    });

    // Sort by date desc
    query = query.sort('-createdAt');

    const items = await query;

    res.status(200).json({
        success: true,
        count: items.length,
        data: items
    });
});

// @desc      Get single item
// @route     GET /api/v1/lostfound/:id
// @access    Private
exports.getItem = asyncHandler(async (req, res, next) => {
    const item = await LostFoundItem.findById(req.params.id).populate('postedBy', 'username email');

    if (!item) {
        return next(new ErrorResponse(`No item found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: item
    });
});

// @desc      Create new item
// @route     POST /api/v1/lostfound
// @access    Private
exports.createItem = asyncHandler(async (req, res, next) => {
    req.body.postedBy = req.user.id;

    const item = await LostFoundItem.create(req.body);

    res.status(201).json({
        success: true,
        data: item
    });
});

// @desc      Update item
// @route     PUT /api/v1/lostfound/:id
// @access    Private (Owner/Admin)
exports.updateItem = asyncHandler(async (req, res, next) => {
    let item = await LostFoundItem.findById(req.params.id);

    if (!item) {
        return next(new ErrorResponse(`No item found with id ${req.params.id}`, 404));
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to update this item`, 401));
    }

    item = await LostFoundItem.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: item
    });
});

// @desc      Delete item
// @route     DELETE /api/v1/lostfound/:id
// @access    Private (Owner/Admin)
exports.deleteItem = asyncHandler(async (req, res, next) => {
    const item = await LostFoundItem.findById(req.params.id);

    if (!item) {
        return next(new ErrorResponse(`No item found with id ${req.params.id}`, 404));
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to delete this item`, 401));
    }

    await item.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc      Claim item (Request)
// @route     POST /api/v1/lostfound/:id/claim
// @access    Private
exports.claimItem = asyncHandler(async (req, res, next) => {
    const item = await LostFoundItem.findById(req.params.id);

    if (!item) {
        return next(new ErrorResponse(`No item found with id ${req.params.id}`, 404));
    }

    if (item.status === 'Claimed') {
        return next(new ErrorResponse(`Item already claimed`, 400));
    }

    // Notify Owner
    if (req.io) {
        req.io.to(item.postedBy.toString()).emit('notification', {
            message: `User ${req.user.username} wants to claim your item: ${item.itemName}`,
            itemId: item._id,
            claimerId: req.user.id
        });
    }

    res.status(200).json({
        success: true,
        message: 'Claim request sent to owner'
    });
});
