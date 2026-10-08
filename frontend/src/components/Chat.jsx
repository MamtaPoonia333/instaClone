function Chat({
  user,
  messages,
  currentUserId,
  input,
  loading,
  sending,
  error,
  onChangeInput,
  onSend,
  onBack
}) {
  if (!user) {
    return (
      <section className="chat-empty card">
        <div className="chat-empty-icon">✦</div>
        <h2>Your messages</h2>
        <p>Select a conversation or find someone to start chatting.</p>
      </section>
    )
  }

  return (
    <section className="chat-room card">
      <header className="chat-room-header">
        <button type="button" className="chat-back-btn" onClick={onBack} aria-label="Back to chats">←</button>
        <img src={user.profileImg} alt="" className="chat-avatar large" />
        <div>
          <strong>@{user.username}</strong>
          <small>{user.bio || 'Say hello'}</small>
        </div>
      </header>
      <div className="chat-messages" aria-live="polite">
        {loading ? <p className="chat-muted">Loading messages...</p> : null}
        {!loading && messages.length === 0 ? <p className="chat-muted chat-start-hint">No messages yet. Say hello!</p> : null}
        {messages.map((message) => {
          const mine = message.sender === currentUserId || message.sender?._id === currentUserId
          return (
            <div className={mine ? 'message-row mine' : 'message-row'} key={message._id}>
              <div className="message-bubble">
                <span>{message.content}</span>
                <time dateTime={message.createdAt}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </time>
              </div>
            </div>
          )
        })}
      </div>
      {error ? <p className="chat-error">{error}</p> : null}
      <form className="message-form" onSubmit={onSend}>
        <input
          value={input}
          onChange={(event) => onChangeInput(event.target.value)}
          placeholder="Write a message..."
          maxLength={2000}
          aria-label="Message"
        />
        <button type="submit" disabled={sending || !input.trim()}>{sending ? '...' : 'Send'}</button>
      </form>
    </section>
  )
}

export default Chat