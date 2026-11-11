const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  toggleFollow,
  getSuggestedUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/suggestions', protect, getSuggestedUsers);
router.get('/:username', getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/:id/follow', protect, toggleFollow);

module.exports = router;

