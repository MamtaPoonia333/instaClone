// Profile card (avatar, stats, bio editor, logout/delete) + grid of
// the logged-in user's own posts.
function ProfilePage({
  currentUser,
  profileStats,
  ownPosts,
  totalLikesOnOwnPosts,
  onAvatarPick,
  onBioChange,
  onProfileUpdate,
  isProfileSaving,
  profileUpdateMessage,
  onLogout,
  onDeleteAccount
}) {
  return (
    <>
      <section className="card profile-card">
        <div className="profile-head">
          <div className="avatar-wrap">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="User avatar" className="avatar" />
            ) : (
              <div className="avatar avatar-fallback">
                {(currentUser.username || 'U').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h2>@{currentUser.username || 'you'}</h2>
            <p>{currentUser.email}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div>
            <svg className="stat-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.75 3.75A1.75 1.75 0 0 0 3 5.5v13c0 .97.78 1.75 1.75 1.75h14.5c.97 0 1.75-.78 1.75-1.75v-13A1.75 1.75 0 0 0 19.25 3.75zm0 1.5h14.5c.14 0 .25.11.25.25v8.05l-2.72-2.72a1.75 1.75 0 0 0-2.47 0l-2.47 2.47-1.34-1.34a1.75 1.75 0 0 0-2.47 0L4.5 15.5V5.5c0-.14.11-.25.25-.25" />
            </svg>
            <strong>{ownPosts.length}</strong>
          </div>
          <div>
            <svg className="stat-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 12.75a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5m0 1.5c-4.2 0-7.5 2.05-7.5 4.67 0 .46.37.83.83.83h13.34c.46 0 .83-.37.83-.83 0-2.62-3.3-4.67-7.5-4.67" />
            </svg>
            <strong>{profileStats.followersCount}</strong>
          </div>
          <div>
            <svg className="stat-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.77 20.83a1.1 1.1 0 0 1-1.54 0L4.6 14.2A5.75 5.75 0 1 1 12 6.8a5.75 5.75 0 1 1 7.4 7.4z" />
            </svg>
            <strong>{totalLikesOnOwnPosts}</strong>
          </div>
        </div>

        <div className="profile-controls">
          <label className="file-label icon-only" aria-label="Upload avatar">
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11.25 4a.75.75 0 0 1 1.5 0v6.25H19a.75.75 0 0 1 0 1.5h-6.25V18a.75.75 0 0 1-1.5 0v-6.25H5a.75.75 0 0 1 0-1.5h6.25z" />
            </svg>
            <input
              className="file-input-hidden"
              type="file"
              accept="image/*"
              onChange={onAvatarPick}
            />
          </label>

          <label aria-label="Bio">
            <textarea
              placeholder="Write your bio"
              value={currentUser.bio}
              onChange={onBioChange}
              rows={3}
            />
          </label>

          <button
            type="button"
            className="profile-save-btn"
            onClick={onProfileUpdate}
            aria-label="Update bio"
            disabled={isProfileSaving}
          >
            {isProfileSaving ? 'Updating...' : 'Update Bio'}
          </button>

          {profileUpdateMessage ? <p className="post-caption">{profileUpdateMessage}</p> : null}
        </div>

        <div className="profile-actions">
          <button type="button" onClick={onLogout} aria-label="Logout">
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 4.75A.75.75 0 0 1 10.75 4h6.75c1.1 0 2 .9 2 2v12a2 2 0 0 1-2 2h-6.75a.75.75 0 0 1 0-1.5h6.75a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5h-6.75A.75.75 0 0 1 10 4.75m2.03 7.78-2.5-2.5a.75.75 0 1 0-1.06 1.06l1.22 1.22H4.75a.75.75 0 0 0 0 1.5h4.94l-1.22 1.22a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06" />
            </svg>
          </button>
          <button type="button" className="danger-btn" onClick={onDeleteAccount} aria-label="Delete account">
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 3.75A2.25 2.25 0 0 0 6.75 6v.25H4.5a.75.75 0 0 0 0 1.5h.6l.9 11.48A2 2 0 0 0 8 21h8a2 2 0 0 0 2-1.77l.9-11.48h.6a.75.75 0 0 0 0-1.5h-2.25V6A2.25 2.25 0 0 0 15 3.75zm6.75 4-1 12H9.25l-1-12zm-7.5-1.5V6A.75.75 0 0 1 9 5.25h6A.75.75 0 0 1 15.75 6v.25z" />
            </svg>
          </button>
        </div>
      </section>

      <section className="card own-posts-card">
        {ownPosts.length === 0 ? (
          <div className="empty-state" aria-hidden="true">
            <svg className="stat-icon" viewBox="0 0 24 24">
              <path d="M4.75 3.75A1.75 1.75 0 0 0 3 5.5v13c0 .97.78 1.75 1.75 1.75h14.5c.97 0 1.75-.78 1.75-1.75v-13A1.75 1.75 0 0 0 19.25 3.75zm0 1.5h14.5c.14 0 .25.11.25.25v13a.25.25 0 0 1-.25.25H4.75a.25.25 0 0 1-.25-.25V5.5c0-.14.11-.25.25-.25" />
            </svg>
          </div>
        ) : (
          <div className="own-post-grid">
            {ownPosts.map((post) => (
              <img key={post._id || post.id} src={post.image} alt={post.caption} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default ProfilePage
