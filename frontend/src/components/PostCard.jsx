// A single post in the feed: image, like/comment/share actions, and
// an inline comment thread. All state (likes, comments, expanded
// image, etc.) lives in App.jsx — this component just renders what
// it's given and calls back up through the on* props.
function PostCard({
  post,
  isExpanded,
  isFollowing,
  isLiked,
  commentsOpen,
  commentsLoading,
  comments,
  commentInput,
  currentUsername,
  onToggleFollow,
  onTogglePostSize,
  onToggleLike,
  onToggleComments,
  onCommentInputChange,
  onAddComment,
  onDeleteComment
}) {
  const postId = post._id || post.id
  const postUsername = post.username || 'unknown'

  return (
    <article className="card post">
      <div className="post-head">
        <strong className="user-chip">@{postUsername}</strong>
        <button
          className="ghost-btn icon-btn"
          onClick={() => onToggleFollow(postUsername)}
          aria-label={isFollowing ? 'Following' : 'Follow'}
        >
          {isFollowing ? (
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.2 7.2a.75.75 0 0 1 1.06 0l2.04 2.04a.75.75 0 1 1-1.06 1.06l-1.51-1.5-3.17 3.17a.75.75 0 0 1-1.06-1.06zM9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 1.5c-3.2 0-5.75 1.6-5.75 3.57 0 .38.3.68.68.68h9.03a5.2 5.2 0 0 1-.22-1.5c0-1.06.33-2.03.9-2.83-.99-.6-2.26-.92-3.64-.92" />
            </svg>
          ) : (
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 1.5c-3.2 0-5.75 1.6-5.75 3.57 0 .38.3.68.68.68h10.14a.75.75 0 0 0 .65-1.13A4.7 4.7 0 0 0 9 13.5m9.25-1.75V10.5H17a.75.75 0 0 1 0-1.5h1.25V7.75a.75.75 0 0 1 1.5 0V9H21a.75.75 0 0 1 0 1.5h-1.25v1.25a.75.75 0 0 1-1.5 0" />
            </svg>
          )}
        </button>
      </div>

      <button
        type="button"
        className={isExpanded ? 'post-media-toggle expanded' : 'post-media-toggle'}
        onClick={() => onTogglePostSize(postId)}
        aria-label={isExpanded ? 'Shrink post image' : 'Expand post image'}
      >
        <img className={isExpanded ? 'post-media expanded' : 'post-media'} src={post.image} alt={post.caption} />
      </button>

      <div className="post-actions">
        <button
          className="ghost-btn icon-btn"
          onClick={() => onToggleLike(postId)}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          {isLiked ? (
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.77 20.83a1.1 1.1 0 0 1-1.54 0L4.6 14.2A5.75 5.75 0 1 1 12 6.8a5.75 5.75 0 1 1 7.4 7.4z" />
            </svg>
          ) : (
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20.2a.75.75 0 0 1-.53-.22l-6.63-6.64A5.5 5.5 0 1 1 12 5.26a5.5 5.5 0 1 1 7.16 8.08l-6.63 6.64a.75.75 0 0 1-.53.22m-4-13.7a4 4 0 0 0-2.1 7.42l6.1 6.11 6.1-6.1A4 4 0 1 0 12.45 8.2a.75.75 0 0 1-.9 0A4 4 0 0 0 8 6.5" />
            </svg>
          )}
        </button>
        <button
          className="ghost-btn icon-btn"
          type="button"
          aria-label="Comment"
          onClick={() => onToggleComments(postId)}
        >
          <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5.5 4.75h13A2.75 2.75 0 0 1 21.25 7.5v8A2.75 2.75 0 0 1 18.5 18.25H10.4L6 21.5a.75.75 0 0 1-1.2-.6v-2.65A2.75 2.75 0 0 1 2.75 15.5v-8A2.75 2.75 0 0 1 5.5 4.75m0 1.5c-.69 0-1.25.56-1.25 1.25v8c0 .69.56 1.25 1.25 1.25h.8v2.66l3.6-2.66h8.6c.69 0 1.25-.56 1.25-1.25v-8c0-.69-.56-1.25-1.25-1.25z" />
          </svg>
        </button>
        <button className="ghost-btn icon-btn" type="button" aria-label="Share">
          <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.03 3.97a.75.75 0 0 0-.76-.18L4.62 9.29a1.75 1.75 0 0 0 .05 3.29l5.9 2.06 2.07 5.9a1.75 1.75 0 0 0 3.29.05l5.49-14.65a.75.75 0 0 0-.19-.77M5.2 10.7a.25.25 0 0 1-.01-.47l12.96-4.86-7.18 7.18zm8.86 9.32a.25.25 0 0 1-.47-.01l-1.86-5.29 7.17-7.17z" />
          </svg>
        </button>
      </div>

      <p className="post-caption">
        {post.likesCount || 0} likes · {post.commentsCount || 0} comments
      </p>

      <p className="post-caption">{post.caption}</p>

      {commentsOpen ? (
        <div className="comments-wrap">
          {commentsLoading ? (
            <p className="post-caption comments-loading">Loading comments...</p>
          ) : (
            <>
              {comments.length === 0 ? (
                <p className="post-caption comments-empty">No comments yet</p>
              ) : (
                <div className="comments-list">
                  {comments.map((comment) => (
                    <p className="post-caption comment-item" key={comment._id}>
                      <span className="comment-user">@{comment.user}</span>: {comment.text}{' '}
                      {comment.user === currentUsername ? (
                        <button
                          type="button"
                          className="ghost-btn comment-delete-btn"
                          onClick={() => onDeleteComment(postId, comment._id)}
                          aria-label="Delete comment"
                        >
                          delete
                        </button>
                      ) : null}
                    </p>
                  ))}
                </div>
              )}

              <div className="comment-input-row">
                <input
                  type="text"
                  placeholder="Add a comment"
                  className="comment-input"
                  value={commentInput}
                  onChange={(e) => onCommentInputChange(postId, e.target.value)}
                />
                <button
                  type="button"
                  className="comment-post-btn"
                  onClick={() => onAddComment(postId)}
                  aria-label="Post comment"
                >
                  Post
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </article>
  )
}

export default PostCard
