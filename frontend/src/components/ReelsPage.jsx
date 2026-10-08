import PostCard from './PostCard'

function ReelsPage(props) {
  const reels = props.posts.filter((post) => post.mediaType === 'video')

  return (
    <section className="reels-page">
      {reels.length === 0 ? (
        <div className="card empty-feed-card">
          <h2>No reels yet</h2>
          <p className="post-caption">Upload a video to start your reel feed.</p>
        </div>
      ) : (
        <div className="reels-list">
          {reels.map((post, index) => {
            const postId = post._id || post.id
            return (
              <article className="reel-slide" key={postId}>
                <PostCard
                  {...props}
                  post={post}
                  isExpanded={Boolean(props.expandedPosts[postId])}
                  isFollowing={Boolean(props.following[post.username])}
                  isLiked={Boolean(props.likes[postId])}
                  commentsOpen={Boolean(props.commentsOpenByPost[postId])}
                  commentsLoading={Boolean(props.commentsLoadingByPost[postId])}
                  comments={props.commentsByPost[postId] || []}
                  commentInput={props.commentInputByPost[postId] || ''}
                />
                <div className="reel-navigation" aria-label="Reel navigation">
                  <button type="button" onClick={() => props.onMoveReel(index, -1)} disabled={index === 0} aria-label="Previous reel">↑</button>
                  <button type="button" onClick={() => props.onMoveReel(index, 1)} disabled={index === reels.length - 1} aria-label="Next reel">↓</button>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {props.actionError ? <p className="post-caption">{props.actionError}</p> : null}
    </section>
  )
}

export default ReelsPage
