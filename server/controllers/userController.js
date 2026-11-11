const User = require('../models/User');
const Post = require('../models/Post');

// @desc Get user profile by username
// @route GET /api/users/:username
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username.toLowerCase()
    })
      .select('-password')
      .populate('followers', 'name username avatar')
      .populate('following', 'name username avatar');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const postsCount = await Post.countDocuments({ user: user._id });

    res.json({
      success: true,
      user,
      stats: {
        postsCount,
        followersCount: user.followers.length,
        followingCount: user.following.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Update user profile
// @route PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, bio, location, website, avatarUrl } = req.body;

    if (name) user.name = name.trim();
    if (typeof bio !== 'undefined') user.bio = bio;
    if (typeof location !== 'undefined') user.location = location;
    if (typeof website !== 'undefined') user.website = website;

    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    } else if (avatarUrl) {
      user.avatar = avatarUrl;
    }

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc Follow / Unfollow a user
// @route PUT /api/users/:id/follow
exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User to follow not found' });
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc Get suggested users to follow
// @route GET /api/users/suggestions
exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const excludeIds = currentUserId ? [currentUserId, ...(req.user.following || [])] : [];

    const suggestions = await User.find({ _id: { $nin: excludeIds } })
      .select('name username avatar bio followers')
      .limit(6);

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

