import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Send,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Format timestamp helper
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d`;
  return date.toLocaleDateString();
};

export const PostCard = ({
  post,
  onTagClick,
  onUserClick,
  onPostDeleted,
  onOpenAuth,
  onShowToast
}) => {
  const { user, isAuthenticated } = useAuth();

  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const currentUserId = user?._id?.toString();
  const isLiked = currentUserId && likes.some((id) => (id._id || id).toString() === currentUserId);
  const isAuthor = currentUserId && post.user?._id?.toString() === currentUserId;

  const handleLike = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    // Optimistic UI update
    if (isLiked) {
      setLikes((prev) => prev.filter((id) => (id._id || id).toString() !== currentUserId));
    } else {
      setLikes((prev) => [...prev, currentUserId]);
    }

    try {
      const res = await api.toggleLike(post._id);
      if (res.success) {
        setLikes(res.likes);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert if error
      setLikes(post.likes);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.addComment(post._id, commentText);
      if (res.success) {
        setComments(res.comments);
        setCommentText('');
      }
    } catch (err) {
      alert(`Failed to add comment: ${err.message}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await api.deleteComment(post._id, commentId);
      if (res.success) {
        setComments(res.comments);
      }
    } catch (err) {
      alert(`Failed to delete comment: ${err.message}`);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await api.deletePost(post._id);
      if (res.success) {
        if (onPostDeleted) onPostDeleted(post._id);
        if (onShowToast) onShowToast('Post deleted successfully', 'success');
      }
    } catch (err) {
      alert(`Failed to delete post: ${err.message}`);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/#post-${post._id}`;
    navigator.clipboard?.writeText(postUrl);
    if (onShowToast) onShowToast('Post link copied to clipboard!', 'success');
  };

  // Render text with interactive hashtag spans
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(#[a-z0-9_]+)/gi);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const cleanTag = part.substring(1);
        return (
          <span
            key={index}
            className="hashtag-pill"
            onClick={(e) => {
              e.stopPropagation();
              if (onTagClick) onTagClick(cleanTag);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article className="post-card" id={`post-${post._id}`}>
      {/* Author Avatar */}
      <img
        src={
          post.user?.avatar ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user?.username || 'user'}`
        }
        alt={post.user?.name || 'User'}
        className="post-avatar"
        onClick={() => onUserClick && onUserClick(post.user?.username)}
      />

      <div className="post-body">
        {/* Header Row */}
        <div className="post-author-row">
          <div className="post-author-info">
            <span
              className="author-name"
              onClick={() => onUserClick && onUserClick(post.user?.username)}
            >
              {post.user?.name || 'Community Member'}
            </span>
            <span className="author-handle">
              @{post.user?.username || 'anonymous'}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span className="post-time">{formatRelativeTime(post.createdAt)}</span>
          </div>

          {isAuthor && (
            <button
              onClick={handleDeletePost}
              title="Delete post"
              className="action-btn delete-btn"
              style={{ padding: '4px 8px' }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Content text */}
        {post.content && (
          <p className="post-content-text">{renderFormattedText(post.content)}</p>
        )}

        {/* Media attachment */}
        {post.image && (
          <div className="post-media-container">
            <img src={post.image} alt="Post media" loading="lazy" />
          </div>
        )}

        {/* Action Engagement Bar */}
        <div className="post-actions">
          {/* Like */}
          <button
            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Heart size={18} />
            <span>{likes.length}</span>
          </button>

          {/* Comment toggle */}
          <button
            className="action-btn comment-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={18} />
            <span>{comments.length}</span>
          </button>

          {/* Share / Copy link */}
          <button className="action-btn" onClick={handleShare} title="Share link">
            <Share2 size={18} />
          </button>
        </div>

        {/* Expandable Comments Drawer */}
        {showComments && (
          <div className="comments-tray">
            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="comment-input-row">
              <input
                type="text"
                placeholder={
                  isAuthenticated ? 'Write a friendly reply...' : 'Sign in to reply...'
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="comment-input"
                maxLength={500}
                onClick={() => {
                  if (!isAuthenticated) onOpenAuth();
                }}
              />
              <button
                type="submit"
                className="comment-send-btn"
                disabled={!commentText.trim() || isSubmittingComment}
              >
                <Send size={14} />
              </button>
            </form>

            {/* Comment List */}
            {comments.map((comment) => {
              const isCommentAuthor =
                currentUserId &&
                (comment.user?._id?.toString() === currentUserId ||
                  comment.user?.toString() === currentUserId);

              return (
                <div key={comment._id} className="comment-item">
                  <img
                    src={
                      comment.user?.avatar ||
                      `https://api.dicebear.com/7.x/adventurer/svg?seed=${
                        comment.user?.username || 'commenter'
                      }`
                    }
                    alt="avatar"
                    className="comment-avatar"
                  />
                  <div className="comment-body">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span className="comment-author-name">
                          {comment.user?.name || 'Dev'}
                        </span>
                        <span className="comment-time">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>

                      {(isCommentAuthor || isAuthor) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          style={{ color: 'var(--text-muted)', padding: '2px 4px' }}
                          title="Delete comment"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
};

