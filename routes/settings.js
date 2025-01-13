const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');


router.get('/settings', settingsController.getSettingsPage);
router.post('/settings', settingsController.postSettings);
router.get('/settings/getsettings',settingsController.getSettingsDetails)

module.exports = router;