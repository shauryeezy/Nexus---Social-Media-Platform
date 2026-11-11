import React, { useEffect, useState } from 'react';
import { Search, TrendingUp, UserPlus, Check, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TRENDING_TAGS = [
  { tag: 'mern', posts: '1.4k posts' },
  { tag: 'reactjs', posts: '2.8k posts' },
  { tag: 'webdev', posts: '5.2k posts' },
  { tag: 'javascript', posts: '4.1k posts' },
  { tag: 'mongodb', posts: '890 posts' },
  { tag: 'uxdesign', posts: '620 posts' }
];

export const RightSidebar = ({
  searchQuery,
  setSearchQuery,
  activeTag,
  setActiveTag,
  onUserClick,
  onOpenAuth
}) => {
  const { user, isAuthenticated } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await api.getSuggestions();
        if (res.success && res.suggestions) {
          setSuggestions(res.suggestions);
          // Pre-populate following state
          if (user?.following) {
            const map = {};
            user.following.forEach((f) => {
              const id = (f._id || f).toString();
              map[id] = true;
            });
            setFollowingMap(map);
          }
        }
      } catch (err) {
        // public view fallback
      }
    };

    fetchSuggestions();
  }, [user]);

  const handleFollowToggle = async (targetUserId) => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    const wasFollowing = !!followingMap[targetUserId];
    // Optimistic toggle
    setFollowingMap((prev) => ({ ...prev, [targetUserId]: !wasFollowing }));

    try {
      await api.toggleFollow(targetUserId);
    } catch (err) {
      // Revert if error
      setFollowingMap((prev) => ({ ...prev, [targetUserId]: wasFollowing }));
    }
  };

  return (
    <aside className="right-sidebar">
      {/* Search Input Box */}
      <div className="search-box">
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search posts, topics, keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Active Filter Pill indicator */}
      {(searchQuery || activeTag) && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem'
          }}
        >
          <span>
            Filtering by: <strong>{searchQuery ? `"${searchQuery}"` : `#${activeTag}`}</strong>
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTag('');
            }}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Trending Topics Widget */}
      <div className="widget-card">
        <h3 className="widget-title">
          <TrendingUp size={18} color="var(--accent-primary)" />
          Trending Topics
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {TRENDING_TAGS.map(({ tag, posts }) => (
            <div
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeTag === tag ? 'var(--bg-surface-hover)' : 'transparent',
                transition: 'var(--transition)'
              }}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  #{tag}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{posts}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who to Follow Widget */}
      <div className="widget-card">
        <h3 className="widget-title">
          <UserPlus size={18} color="var(--accent-secondary)" />
          Who to Follow
        </h3>
        {suggestions.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            All caught up with suggested creators!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {suggestions.slice(0, 4).map((sugUser) => {
              const isFollowing = !!followingMap[sugUser._id];
              return (
                <div
                  key={sugUser._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      flex: 1,
                      overflow: 'hidden'
                    }}
                    onClick={() => onUserClick && onUserClick(sugUser.username)}
                  >
                    <img
                      src={
                        sugUser.avatar ||
                        `https://api.dicebear.com/7.x/adventurer/svg?seed=${sugUser.username}`
                      }
                      alt={sugUser.name}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div
                        style={{
                          fontWeight: '700',
                          fontSize: '0.88rem',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {sugUser.name}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        @{sugUser.username}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFollowToggle(sugUser._id)}
                    className={isFollowing ? 'btn-secondary' : 'composer-publish-btn'}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tech Stack Info Banner */}
      <div
        style={{
          padding: '12px 16px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: '1.4'
        }}
      >
        Built strictly with the <strong>MERN Stack</strong>: MongoDB, Express.js, React.js, and Node.js.
        Features modern responsive UX, JWT auth, and dynamic feeds.
      </div>
    </aside>
  );
};

