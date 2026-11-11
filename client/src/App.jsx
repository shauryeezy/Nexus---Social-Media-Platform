import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Home,
  Users,
  Compass,
  User,
  Plus,
  RefreshCw,
  Search,
  MessageSquare
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { CreatePost } from './components/CreatePost';
import { PostCard } from './components/PostCard';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { Toast } from './components/Toast';
import { api } from './services/api';

const SocialMediaApp = () => {
  const { user, isAuthenticated } = useAuth();

  // Navigation & filter state
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'following' | 'explore'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');

  // Data state
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('nexus_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const params = {};
      if (activeTab === 'following') {
        params.feedType = 'following';
      }
      if (activeTag) {
        params.tag = activeTag;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.getPosts(params);
      if (res.success && res.posts) {
        setPosts(res.posts);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  }, [activeTab, activeTag, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setCreatePostModalOpen(false);
    showToast('Post shared with the community!', 'success');
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  return (
    <div className="app-container">
      {/* Left Sidebar (Desktop Navigation) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActiveTag('');
          setSearchQuery('');
        }}
        onOpenCreatePost={() => setCreatePostModalOpen(true)}
        onOpenProfile={(uname) => setProfileModalUser(uname)}
        onOpenAuth={() => setAuthModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Central Stream */}
      <main className="main-content">
        {/* Sticky Header with Feed Tabs */}
        <header className="feed-header">
          <div className="feed-tabs">
            <button
              className={`feed-tab ${activeTab === 'all' && !activeTag && !searchQuery ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('all');
                setActiveTag('');
                setSearchQuery('');
              }}
            >
              For You
            </button>
            <button
              className={`feed-tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => {
                if (!isAuthenticated) {
                  setAuthModalOpen(true);
                } else {
                  setActiveTab('following');
                  setActiveTag('');
                  setSearchQuery('');
                }
              }}
            >
              Following
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            title="Refresh feed"
            className="action-btn"
            style={{ marginLeft: '10px' }}
          >
            <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </header>

        {/* Top Composer Box */}
        <CreatePost
          onPostCreated={handlePostCreated}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        {/* Active Tag or Search Indicator banner */}
        {(activeTag || searchQuery) && (
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.9rem'
            }}
          >
            <span>
              Showing posts for{' '}
              <strong>{activeTag ? `#${activeTag}` : `"${searchQuery}"`}</strong>
            </span>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              onClick={() => {
                setActiveTag('');
                setSearchQuery('');
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Feed Posts Stream */}
        {loadingPosts ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Sparkles
              size={36}
              color="var(--accent-primary)"
              style={{ animation: 'spin 2s linear infinite', marginBottom: '12px' }}
            />
            <p>Loading the latest community thoughts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <MessageSquare
              size={44}
              color="var(--text-muted)"
              style={{ marginBottom: '14px', opacity: 0.5 }}
            />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No posts found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 16px' }}>
              {activeTab === 'following'
                ? "You aren't following anyone with recent posts yet. Explore creators on the right!"
                : 'Be the first developer to post a new thought!'}
            </p>
            {activeTab === 'following' && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setActiveTab('all');
                  setActiveTag('');
                }}
              >
                Browse Global Feed
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onTagClick={(tag) => setActiveTag(tag)}
              onUserClick={(uname) => setProfileModalUser(uname)}
              onPostDeleted={handlePostDeleted}
              onOpenAuth={() => setAuthModalOpen(true)}
              onShowToast={showToast}
            />
          ))
        )}
      </main>

      {/* Right Sidebar (Search, Suggestions, Trending) */}
      <RightSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        onUserClick={(uname) => setProfileModalUser(uname)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <button
          className="action-btn"
          onClick={() => {
            setActiveTab('all');
            setActiveTag('');
            setSearchQuery('');
          }}
        >
          <Home size={22} color={activeTab === 'all' ? 'var(--accent-primary)' : 'inherit'} />
        </button>

        <button
          className="action-btn"
          onClick={() => {
            if (!isAuthenticated) setAuthModalOpen(true);
            else setActiveTab('following');
          }}
        >
          <Users size={22} color={activeTab === 'following' ? 'var(--accent-primary)' : 'inherit'} />
        </button>

        <button
          className="composer-publish-btn"
          style={{ width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => {
            if (!isAuthenticated) setAuthModalOpen(true);
            else setCreatePostModalOpen(true);
          }}
        >
          <Plus size={22} />
        </button>

        <button
          className="action-btn"
          onClick={() => {
            if (!isAuthenticated) setAuthModalOpen(true);
            else setProfileModalUser(user.username);
          }}
        >
          <User size={22} />
        </button>
      </nav>

      {/* Floating Create Post Modal (Triggered from sidebar or mobile) */}
      {createPostModalOpen && (
        <div className="modal-overlay" onClick={() => setCreatePostModalOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '600px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Create Post</h3>
              <button
                onClick={() => setCreatePostModalOpen(false)}
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 0 }}>
              <CreatePost
                onPostCreated={handlePostCreated}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          showToast('Welcome back!', 'success');
          fetchPosts();
        }}
      />

      {/* User Profile Modal */}
      <ProfileModal
        username={profileModalUser}
        isOpen={!!profileModalUser}
        onClose={() => setProfileModalUser(null)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onShowToast={showToast}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocialMediaApp />
    </AuthProvider>
  );
}
