const Post = require('../models/Post');
const User = require('../models/User');

// @desc Create a new post
// @route POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { content, tags, imageUrl } = req.body;

    if (!content && !req.file && !imageUrl) {
      return res.status(400).json({ error: 'Post must have text or an image' });
    }

    let image = imageUrl || '';
    if (req.file) {
      // Store relative path so client can load it via static route
      image = `/uploads/${req.file.filename}`;
    }

    // Process tags (array or comma-separated string)
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === 'string') {
        parsedTags = tags
          .split(',')
          .map((t) => t.trim().replace(/^#/, ''))
          .filter(Boolean);
      }
    }

    // Extract hashtags automatically from content if present
    if (content) {
      const matchedHashtags = content.match(/#[a-z0-9_]+/gi);
      if (matchedHashtags) {
        const hashTagsClean = matchedHashtags.map((h) => h.substring(1));
        parsedTags = Array.from(new Set([...parsedTags, ...hashTagsClean]));
      }
    }

    const newPost = await Post.create({
      user: req.user._id,
      content: content || '',
      image,
      tags: parsedTags
    });

    const populatedPost = await Post.findById(newPost._id)
      .populate('user', 'name username avatar')
      .populate('comments.user', 'name username avatar');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: error.message || 'Server error creating post' });
  }
};

// @desc Get posts feed
// @route GET /api/posts
exports.getPosts = async (req, res) => {
  try {
    const { feedType, tag, search, username, limit = 50, page = 1 } = req.query;

    const query = {};

    // Filter by tag
    if (tag) {
      query.tags = { $in: [new RegExp(`^${tag}$`, 'i')] };
    }

    // Filter by search string
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ content: regex }, { tags: { $in: [regex] } }];
    }

    // Filter by specific username
    if (username) {
      const targetUser = await User.findOne({ username: username.toLowerCase() });
      if (targetUser) {
        query.user = targetUser._id;
      } else {
        return res.json({ success: true, posts: [], total: 0 });
      }
    }

    // Filter by 'following' only
    if (feedType === 'following' && req.user) {
      const currentUser = await User.findById(req.user._id);
      query.user = { $in: [...(currentUser.following || []), req.user._id] };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name username avatar bio')
      .populate('comments.user', 'name username avatar');

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      posts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: error.message || 'Server error fetching posts' });
  }
};

// @desc Get single post
// @route GET /api/posts/:id
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name username avatar bio')
      .populate('comments.user', 'name username avatar');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Toggle Like / Unlike post
// @route PUT /api/posts/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userIdStr = req.user._id.toString();
    const alreadyLikedIndex = post.likes.findIndex(
      (likeId) => likeId.toString() === userIdStr
    );

    let isLiked = false;
    if (alreadyLikedIndex > -1) {
      // Unlike
      post.likes.splice(alreadyLikedIndex, 1);
      isLiked = false;
    } else {
      // Like
      post.likes.push(req.user._id);
      isLiked = true;
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes,
      likesCount: post.likes.length,
      isLiked
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc Add comment to post
// @route POST /api/posts/:id/comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate('user', 'name username avatar')
      .populate('comments.user', 'name username avatar');

    res.status(201).json({
      success: true,
      comments: updatedPost.comments,
      commentsCount: updatedPost.comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc Delete comment
// @route DELETE /api/posts/:id/comment/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only comment creator or post creator can delete
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.user.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    post.comments.pull(commentId);
    await post.save();

    res.json({
      success: true,
      comments: post.comments,
      commentsCount: post.comments.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc Delete post
// @route DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Post removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

