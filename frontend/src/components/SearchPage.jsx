// User search: search box + result list with follow/unfollow buttons.
function SearchPage({
  searchQuery,
  onChangeSearchQuery,
  onSearch,
  isSearchLoading,
  searchError,
  searchResults,
  following,
  currentUsername,
  onToggleFollow
}) {
  return (
    <section className="card user-search-card">
      <form className="user-search-form" onSubmit={onSearch}>
        <input
          type="text"
          placeholder="Search user by username"
          value={searchQuery}
          onChange={(e) => onChangeSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-submit" aria-label="Search users">
          <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 4.75a5.25 5.25 0 1 0 3.34 9.29l4.3 4.3a.75.75 0 1 0 1.06-1.06l-4.3-4.3A5.25 5.25 0 0 0 10 4.75m-3.75 5.25a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0" />
          </svg>
        </button>
      </form>

      {isSearchLoading ? <p className="post-caption">Searching...</p> : null}
      {searchError ? <p className="post-caption">{searchError}</p> : null}

      {!isSearchLoading && !searchError && searchResults.length > 0 ? (
        <div className="user-search-results">
          {searchResults.map((user) => {
            const username = user.username || 'unknown'
            return (
              <article className="user-search-item" key={username}>
                <div className="user-search-meta">
                  <img
                    src={user.profileImg}
                    alt={username}
                    className="search-avatar"
                  />
                  <div>
                    <strong className="user-chip">@{username}</strong>
                    <p className="post-caption user-search-bio">{user.bio || 'No bio yet'}</p>
                  </div>
                </div>
                {username !== currentUsername ? (
                  <button
                    className="ghost-btn"
                    onClick={() => onToggleFollow(username)}
                    aria-label={following[username] ? 'Unfollow user' : 'Follow user'}
                    type="button"
                  >
                    {following[username] ? 'Following' : 'Follow'}
                  </button>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : null}

      {!isSearchLoading && !searchError && searchQuery.trim() && searchResults.length === 0 ? (
        <p className="post-caption">No users found</p>
      ) : null}
    </section>
  )
}

export default SearchPage
