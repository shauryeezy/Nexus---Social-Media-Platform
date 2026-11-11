import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Globe,
  Calendar,
  Edit3,
  UserCheck,
  UserPlus,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PostCard } from './PostCard';

export const ProfileModal = ({
  username,
  isOpen,
  onClose,
  onOpenAuth,
  onShowToast
}) => {
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Edit form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const isSelf = currentUser && profile && currentUser._id === profile._id;

  useEffect(() => {
    if (!isOpen || !username) return;

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.getUserProfile(username),
          api.getPosts({ username })
        ]);

        if (profileRes.success) {
          setProfile(profileRes.user);
          setStats(profileRes.stats);
          setName(profileRes.user.name);
          setBio(profileRes.user.bio || '');
          setLocation(profileRes.user.location || '');
          setWebsite(profileRes.user.website || '');
          setAvatarUrl(profileRes.user.avatar || '');

          if (currentUser?.following) {
            const hasFollowed = currentUser.following.some(
              (f) => (f._id || f).toString() === profileRes.user._id.toString()
            );
            setIsFollowing(hasFollowed);
          }
        }

        if (postsRes.success) {
          setUserPosts(postsRes.posts);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isOpen, username, currentUser]);

  if (!isOpen) return null;

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    const previous = isFollowing;
    setIsFollowing(!previous);
    setStats((prev) => ({
      ...prev,
      followersCount: previous ? prev.followersCount - 1 : prev.followersCount + 1
    }));

    try {
      await api.toggleFollow(profile._id);
    } catch (err) {
      setIsFollowing(previous);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await api.updateProfile({
        name,
        bio,
        location,
        website,
        avatarUrl
      });
      if (res.success && res.user) {
        setProfile(res.user);
        updateUser(res.user);
        setIsEditing(false);
        if (onShowToast) onShowToast('Profile updated!', 'success');
      }
    } catch (err) {
      alert(`Failed to update profile: ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '640px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{profile?.name || 'Profile'}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {stats.postsCount} posts
            </span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 size={32} className="animate-spin" color="var(--accent-primary)" />
            </div>
          ) : profile ? (
            <>
              {/* Header banner */}
              <div className="profile-banner" />

              {/* Avatar and Action button */}
              <div className="profile-avatar-row">
                <img
                  src={
                    profile.avatar ||
                    `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.username}`
                  }
                  alt={profile.name}
                  className="profile-avatar-lg"
                />

                {isSelf ? (
                  <button className="btn-secondary" onClick={() => setIsEditing(!isEditing)}>
                    <Edit3 size={15} style={{ marginRight: '6px' }} />
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                ) : (
                  <button
                    className={isFollowing ? 'btn-secondary' : 'composer-publish-btn'}
                    onClick={handleToggleFollow}
                  >
                    {isFollowing ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserCheck size={16} /> Following
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserPlus size={16} /> Follow
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Edit form or Bio display */}
              <div style={{ padding: '0 20px 16px' }}>
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} style={{ marginTop: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Avatar Image URL</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://..."
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. San Francisco, CA"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Website</label>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="https://..."
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" disabled={savingEdit}>
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                ) : (
                  <>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{profile.name}</h2>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>
                      @{profile.username}
                    </div>

                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '14px' }}>
                      {profile.bio || 'No bio yet.'}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '16px',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {profile.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={15} />
                          {profile.location}
                        </div>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--accent-primary)',
                            textDecoration: 'none'
                          }}
                        >
                          <Globe size={15} />
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={15} />
                        Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    {/* Follower Stats */}
                    <div className="profile-stats-row">
                      <div className="stat-item">
                        <strong>{stats.followingCount}</strong> Following
                      </div>
                      <div className="stat-item">
                        <strong>{stats.followersCount}</strong> Followers
                      </div>
                      <div className="stat-item">
                        <strong>{stats.postsCount}</strong> Posts
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User's Post Timeline */}
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '10px' }}>
                <div style={{ padding: '12px 20px', fontWeight: '700', fontSize: '0.95rem' }}>
                  Posts by @{profile.username}
                </div>
                {userPosts.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No posts shared yet.
                  </div>
                ) : (
                  userPosts.map((p) => (
                    <PostCard
                      key={p._id}
                      post={p}
                      onShowToast={onShowToast}
                      onOpenAuth={onOpenAuth}
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center' }}>User not found</div>
          )}
        </div>
      </div>
    </div>
  );
};

