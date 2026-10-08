function AllChats({
  conversations,
  selectedUser,
  searchQuery,
  searchResults,
  isSearchLoading,
  error,
  onChangeSearchQuery,
  onSearch,
  onSelectConversation
}) {
  return (
    <section className="chats-shell">
      <div className="chats-list card">
        <div className="chats-heading">
          <div>
            <p className="eyebrow">Messages</p>
            <h1>Chats</h1>
          </div>
          <span className="chat-count">{conversations.length}</span>
        </div>

        <form className="chat-search-form" onSubmit={onSearch}>
          <input
            type="search"
            placeholder="Find someone to message"
            value={searchQuery}
            onChange={(event) => onChangeSearchQuery(event.target.value)}
            aria-label="Find someone to message"
          />
          <button type="submit" aria-label="Search users">Search</button>
        </form>

        {error ? <p className="chat-error">{error}</p> : null}
        {isSearchLoading ? <p className="chat-muted">Searching...</p> : null}

        {searchResults.length > 0 ? (
          <div className="chat-results">
            <p className="chat-section-label">People</p>
            {searchResults.map((user) => (
              <button
                type="button"
                className="chat-user-row"
                key={user._id || user.username}
                onClick={() => onSelectConversation(user)}
              >
                <img src={user.profileImg} alt="" className="chat-avatar" />
                <span>
                  <strong>@{user.username}</strong>
                  <small>{user.bio || 'Start a conversation'}</small>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <p className="chat-section-label">Recent</p>
        {conversations.length === 0 ? (
          <p className="chat-muted">No conversations yet. Search for someone above.</p>
        ) : (
          <div className="chat-results">
            {conversations.map(({ user, lastMessage }) => (
              <button
                type="button"
                className={selectedUser?._id === user._id ? 'chat-user-row selected' : 'chat-user-row'}
                key={user._id}
                onClick={() => onSelectConversation(user)}
              >
                <img src={user.profileImg} alt="" className="chat-avatar" />
                <span>
                  <strong>@{user.username}</strong>
                  <small>{lastMessage?.content || 'No messages yet'}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default AllChats