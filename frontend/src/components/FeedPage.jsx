import PostCard from './PostCard'

// Renders the list of posts (or an empty state) plus any action error.
// Looks up each post's per-item state (liked, following, comments open,
// etc.) from the maps App.jsx owns, then hands PostCard plain values.
function FeedPage({
  posts,
  expandedPosts,
  following,
  likes,
  commentsOpenByPost,
  commentsLoadingByPost,
  commentsByPost,
  commentInputByPost,
  currentUsername,
  actionError,
  onToggleFollow,
  onTogglePostSize,
  onToggleLike,
  onToggleComments,
  onCommentInputChange,
  onAddComment,
  onDeleteComment
}) {
  return (
    <>
      <div className="feed-grid">
        {posts.length === 0 ? (
          <section className="card empty-feed-card">
            <h2>No posts yet</h2>
            <p className="post-caption">Be the first to publish something to the timeline.</p>
          </section>
        ) : null}

        {posts.map((post) => {
          const postId = post._id || post.id
          return (
            <PostCard
              key={postId}
              post={post}
              isExpanded={Boolean(expandedPosts[postId])}
              isFollowing={Boolean(following[post.username])}
              isLiked={Boolean(likes[postId])}
              commentsOpen={Boolean(commentsOpenByPost[postId])}
              commentsLoading={Boolean(commentsLoadingByPost[postId])}
              comments={commentsByPost[postId] || []}
              commentInput={commentInputByPost[postId] || ''}
              currentUsername={currentUsername}
              onToggleFollow={onToggleFollow}
              onTogglePostSize={onTogglePostSize}
              onToggleLike={onToggleLike}
              onToggleComments={onToggleComments}
              onCommentInputChange={onCommentInputChange}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
            />
          )
        })}
      </div>
      {actionError ? <p className="post-caption">{actionError}</p> : null}
    </>
  )
}

export default FeedPage
