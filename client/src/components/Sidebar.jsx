import React from 'react';
import {
  Home,
  Users,
  Compass,
  User,
  PlusCircle,
  Sun,
  Moon,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  onOpenCreatePost,
  onOpenProfile,
  onOpenAuth,
  theme,
  toggleTheme
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <aside className="left-sidebar">
      <div>
        {/* Brand */}
        <div className="nav-brand" onClick={() => setActiveTab('all')}>
          <div className="brand-icon-box">
            <Sparkles size={24} />
          </div>
          <span className="brand-title">Nexus</span>
        </div>

        {/* Navigation links */}
        <nav className="nav-items">
          <button
            className={`nav-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <Home />
            <span>Home Feed</span>
          </button>

          <button
            className={`nav-button ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuth();
              } else {
                setActiveTab('following');
              }
            }}
          >
            <Users />
            <span>Following</span>
          </button>

          <button
            className={`nav-button ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            <Compass />
            <span>Explore</span>
          </button>

          <button
            className="nav-button"
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuth();
              } else {
                onOpenProfile(user.username);
              }
            }}
          >
            <User />
            <span>Profile</span>
          </button>

          <button className="nav-button" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun /> : <Moon />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </nav>

        {/* New Post Button */}
        <button
          className="post-trigger-btn"
          onClick={() => {
            if (!isAuthenticated) {
              onOpenAuth();
            } else {
              onOpenCreatePost();
            }
          }}
        >
          <PlusCircle size={20} />
          <span>Post Update</span>
        </button>
      </div>

      {/* User Footer Card */}
      <div>
        {isAuthenticated ? (
          <div className="user-menu-pill" onClick={() => onOpenProfile(user.username)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
                alt={user.name}
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{user.username}</div>
              </div>
            </div>
            <button
              title="Logout"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              style={{ color: 'var(--text-muted)', padding: '6px' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={onOpenAuth}>
            Sign In / Join
          </button>
        )}
      </div>
    </aside>
  );
};

