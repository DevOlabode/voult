const express = require('express');
const router = express.Router();
const catchAsync = require('../../utils/catchAsync');

const { isLoggedIn } = require('../../middleware');
const controller = require('../../controllers/web/settings');

router.get('/settings', isLoggedIn, catchAsync(controller.settingsPage));

router.post('/settings', isLoggedIn, catchAsync(controller.updateSettingss));

router.get('/delete-account', isLoggedIn, catchAsync(controller.deleteAccountForm));

router.post('/delete-account', isLoggedIn, catchAsync(controller.deleteAccount));

module.exports = router;