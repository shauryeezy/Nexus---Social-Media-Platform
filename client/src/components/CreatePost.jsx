import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Hash, X, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const POPULAR_TAGS = ['mern', 'reactjs', 'webdev', 'javascript', 'uxdesign', 'nodejs', 'mongodb'];

export const CreatePost = ({ onPostCreated, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setImageUrl('');
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setFilePreview('');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addTagToContent = (tag) => {
    if (!content.includes(`#${tag}`)) {
      setContent((prev) => (prev ? `${prev} #${tag}` : `#${tag} `));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (!content.trim() && !selectedFile && !imageUrl) {
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('image', selectedFile);
        if (selectedTag) formData.append('tags', selectedTag);
        res = await api.createPost(formData, true);
      } else {
        res = await api.createPost({
          content,
          imageUrl: imageUrl.trim(),
          tags: selectedTag ? [selectedTag] : []
        });
      }

      if (res.success && res.post) {
        setContent('');
        removeImage();
        setShowImageInput(false);
        setSelectedTag('');
        if (onPostCreated) onPostCreated(res.post);
      }
    } catch (err) {
      alert(`Failed to create post: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="composer-card">
      <img
        src={
          user?.avatar ||
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'guest'}`
        }
        alt="Avatar"
        className="composer-avatar"
      />
      <div className="composer-main">
        <textarea
          className="composer-textarea"
          placeholder={
            isAuthenticated
              ? "What's happening in your dev world?"
              : "Sign in to share your updates with the community..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={3}
          onClick={() => {
            if (!isAuthenticated) onOpenAuth();
          }}
        />

        {/* Selected Image Preview */}
        {(filePreview || imageUrl) && (
          <div className="composer-preview-img-box">
            <img src={filePreview || imageUrl} alt="Upload preview" />
            <button className="remove-img-btn" onClick={removeImage}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Image URL Input Bar (Collapsible) */}
        {showImageInput && !filePreview && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="url"
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
              placeholder="Paste direct image URL (https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <button
              className="btn-secondary"
              onClick={() => setShowImageInput(false)}
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            >
              Done
            </button>
          </div>
        )}

        {/* Tag chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0' }}>
          {POPULAR_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              className="hashtag-pill"
              style={{
                fontSize: '0.8rem',
                backgroundColor: 'var(--bg-surface)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)'
              }}
              onClick={() => addTagToContent(t)}
            >
              #{t}
            </button>
          ))}
        </div>

        {/* Action Toolbar */}
        <div className="composer-actions">
          <div className="composer-tools">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="tool-btn"
              title="Upload image"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon size={18} />
              <span>Photo</span>
            </button>

            <button
              type="button"
              className="tool-btn"
              title="Image from URL"
              onClick={() => setShowImageInput(!showImageInput)}
            >
              <Sparkles size={18} />
              <span>URL</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {content.length}/1000
            </span>
            <button
              type="button"
              className="composer-publish-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && !filePreview && !imageUrl)}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Loader2 size={16} className="animate-spin" />
                  Publishing
                </span>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

