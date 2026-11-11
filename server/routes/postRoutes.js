const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  toggleLike,
  addComment,
  deleteComment,
  deletePost
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Optional auth extraction helper for getPosts so 'following' feed works if token is passed
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'mern_social_super_secret_key_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignore token failure for public feed
    }
  }
  next();
};

router.get('/', optionalAuth, getPosts);
router.post('/', protect, upload.single('image'), createPost);
router.get('/:id', getPostById);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.delete('/:id', protect, deletePost);

module.exports = router;

