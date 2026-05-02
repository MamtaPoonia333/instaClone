import { useEffect, useState } from 'react'

const PROD_API_BASE = 'https://instaclone.onrender.com'
const LOCAL_API_BASE = 'http://localhost:3000'
const isRenderHost = window.location.hostname.endsWith('onrender.com')
const API_BASE = import.meta.env.VITE_API_URL || (isRenderHost ? PROD_API_BASE : LOCAL_API_BASE)

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [authMode, setAuthMode] = useState('login')
  const [signupUsername, setSignupUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem('token')))
  const [activePage, setActivePage] = useState('feed')
  const [currentUser, setCurrentUser] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: ''
  })
  const [posts, setPosts] = useState([])
  const [profileStats, setProfileStats] = useState({
    followersCount: 0,
    followeesCount: 0
  })
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploadImageFile, setUploadImageFile] = useState(null)
  const [uploadPreview, setUploadPreview] = useState('')
  const [likes, setLikes] = useState({})
  const [following, setFollowing] = useState({})
  const [authError, setAuthError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [commentsByPost, setCommentsByPost] = useState({})
  const [commentInputByPost, setCommentInputByPost] = useState({})
  const [commentsOpenByPost, setCommentsOpenByPost] = useState({})
  const [commentsLoadingByPost, setCommentsLoadingByPost] = useState({})
  const [expandedPosts, setExpandedPosts] = useState({})
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isUploadLoading, setIsUploadLoading] = useState(false)
  const [pendingLikes, setPendingLikes] = useState({})
  const [pendingFollows, setPendingFollows] = useState({})
  const [pendingComments, setPendingComments] = useState({})
  const [toast, setToast] = useState({ message: '', type: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchError, setSearchError] = useState('')
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [profileUpdateMessage, setProfileUpdateMessage] = useState('')

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  const fetchPosts = async () => {
    if (!token) return

    try {
      const response = await fetch(`${API_BASE}/api/post/get`, {
        headers: authHeaders
      })
      const data = await response.json()
      if (!response.ok) return
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  const fetchUserStats = async (username) => {
    if (!token || !username) return

    try {
      const response = await fetch(`${API_BASE}/api/user/stats/${username}`, {
        headers: authHeaders
      })
      const data = await response.json()
      if (!response.ok) return

      setProfileStats({
        followersCount: data.followersCount || 0,
        followeesCount: data.followeesCount || 0
      })
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  const fetchFollowingState = async (username) => {
    if (!token || !username) return

    try {
      const response = await fetch(`${API_BASE}/api/user/followees/${username}`, {
        headers: authHeaders
      })
      const data = await response.json()
      if (!response.ok) return

      const followMap = {}
      ;(data.followees || []).forEach((entry) => {
        if (entry.followee) {
          followMap[entry.followee] = true
        }
      })

      setFollowing(followMap)
    } catch (error) {
      console.error('Failed to fetch following state:', error)
    }
  }

  const fetchLikedState = async () => {
    if (!token) return

    try {
      const response = await fetch(`${API_BASE}/api/post/likes/me`, {
        headers: authHeaders
      })
      const data = await response.json()
      if (!response.ok) return

      const likesMap = {}
      ;(data.likedPostIds || []).forEach((postId) => {
        likesMap[postId] = true
      })

      setLikes(likesMap)
    } catch (error) {
      console.error('Failed to fetch liked state:', error)
    }
  }

  useEffect(() => {
    if (!loggedIn || !token) return
    fetchPosts()
  }, [loggedIn, token])

  useEffect(() => {
    if (!loggedIn || !token || !currentUser.username) return
    fetchUserStats(currentUser.username)
    fetchFollowingState(currentUser.username)
    fetchLikedState()
  }, [loggedIn, token, currentUser.username])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return

    try {
      setAuthError('')
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        setAuthError(data?.message || 'Login failed')
        return
      }

      setToken(data.token)
      localStorage.setItem('token', data.token)
      setCurrentUser({
        username: data.user?.username || '',
        email: data.user?.email || '',
        bio: data.user?.bio || '',
        avatar: data.user?.profileImg || ''
      })
      setActivePage('feed')
      setLoggedIn(true)
      setPassword('')
    } catch (error) {
      setAuthError('Unable to connect to server')
      console.error('Login failed:', error)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!signupUsername || !email || !password) return

    try {
      setAuthError('')
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: signupUsername,
          email,
          password
        })
      })

      const data = await response.json()
      if (!response.ok) {
        setAuthError(data?.message || 'Signup failed')
        return
      }

      setToken(data.token)
      localStorage.setItem('token', data.token)
      setCurrentUser({
        username: data.user?.username || signupUsername,
        email: data.user?.email || email,
        bio: data.user?.bio || '',
        avatar: data.user?.profileImg || ''
      })
      setActivePage('feed')
      setLoggedIn(true)
      setPassword('')
    } catch (error) {
      setAuthError('Unable to connect to server')
      console.error('Signup failed:', error)
    }
  }

  const toggleLike = async (postId) => {
    if (!postId || !token) return

    const isLiked = Boolean(likes[postId])
    const endpoint = isLiked
      ? `${API_BASE}/api/post/unlike/${postId}`
      : `${API_BASE}/api/post/like/${postId}`

    try {
      setActionError('')
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: authHeaders
      })
      const data = await response.json()
      if (!response.ok) {
        setActionError(data?.message || 'Unable to update like')
        return
      }

      setLikes((prev) => ({ ...prev, [postId]: !isLiked }))
      await fetchPosts()
    } catch (error) {
      setActionError('Unable to update like')
      console.error('Like action failed:', error)
    }
  }

  const toggleFollow = async (username) => {
    if (!username || !token || username === currentUser.username) return

    const isFollowing = Boolean(following[username])
    const endpoint = isFollowing
      ? `${API_BASE}/api/user/unfollow/${username}`
      : `${API_BASE}/api/user/follow/${username}`

    try {
      setActionError('')
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: authHeaders
      })
      const data = await response.json()
      if (!response.ok) {
        setActionError(data?.message || 'Unable to update follow')
        return
      }

      setFollowing((prev) => ({ ...prev, [username]: !isFollowing }))
      await fetchUserStats(currentUser.username)
    } catch (error) {
      setActionError('Unable to update follow')
      console.error('Follow action failed:', error)
    }
  }

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setUploadImageFile(file)
    setUploadPreview(previewUrl)
  }

  const fetchComments = async (postId) => {
    if (!postId || !token) return

    try {
      setCommentsLoadingByPost((prev) => ({ ...prev, [postId]: true }))
      const response = await fetch(`${API_BASE}/api/post/comments/${postId}`, {
        headers: authHeaders
      })
      const data = await response.json()

      if (!response.ok) {
        setActionError(data?.message || 'Unable to fetch comments')
        return
      }

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: data.comments || []
      }))
    } catch (error) {
      setActionError('Unable to fetch comments')
      console.error('Fetch comments failed:', error)
    } finally {
      setCommentsLoadingByPost((prev) => ({ ...prev, [postId]: false }))
    }
  }

  const toggleComments = async (postId) => {
    const isOpen = Boolean(commentsOpenByPost[postId])
    if (isOpen) {
      setCommentsOpenByPost((prev) => ({ ...prev, [postId]: false }))
      return
    }

    setCommentsOpenByPost((prev) => ({ ...prev, [postId]: true }))
    if (!commentsByPost[postId]) {
      await fetchComments(postId)
    }
  }

  const togglePostSize = (postId) => {
    if (!postId) return

    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  const handleCommentInputChange = (postId, value) => {
    setCommentInputByPost((prev) => ({
      ...prev,
      [postId]: value
    }))
  }

  const addComment = async (postId) => {
    const commentText = (commentInputByPost[postId] || '').trim()
    if (!postId || !commentText || !token) return

    try {
      setActionError('')
      const response = await fetch(`${API_BASE}/api/post/comment/${postId}`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: commentText })
      })
      const data = await response.json()

      if (!response.ok) {
        setActionError(data?.message || 'Unable to add comment')
        return
      }

      setCommentInputByPost((prev) => ({ ...prev, [postId]: '' }))
      await fetchComments(postId)
      await fetchPosts()
    } catch (error) {
      setActionError('Unable to add comment')
      console.error('Add comment failed:', error)
    }
  }

  const deleteComment = async (postId, commentId) => {
    if (!postId || !commentId || !token) return

    try {
      setActionError('')
      const response = await fetch(`${API_BASE}/api/post/comment/${postId}/${commentId}`, {
        method: 'DELETE',
        headers: authHeaders
      })
      const data = await response.json()

      if (!response.ok) {
        setActionError(data?.message || 'Unable to delete comment')
        return
      }

      await fetchComments(postId)
      await fetchPosts()
    } catch (error) {
      setActionError('Unable to delete comment')
      console.error('Delete comment failed:', error)
    }
  }

  const handleUploadPost = async (e) => {
    e.preventDefault()
    if (!uploadCaption || !uploadImageFile || !uploadPreview || !token) return

    try {
      setUploadError('')

      const formData = new FormData()
      formData.append('caption', uploadCaption)
      formData.append('image', uploadImageFile)

      const response = await fetch(`${API_BASE}/api/post/upload`, {
        method: 'POST',
        headers: authHeaders,
        body: formData
      })

      const data = await response.json()
      if (!response.ok) {
        setUploadError(data?.message || 'Upload failed')
        return
      }

      setUploadCaption('')
      setUploadImageFile(null)
      setUploadPreview('')
      await fetchPosts()
      setActivePage('feed')
    } catch (error) {
      setUploadError('Unable to upload post')
      console.error('Upload failed:', error)
    }
  }

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const avatarUrl = URL.createObjectURL(file)
    setCurrentUser((prev) => ({ ...prev, avatar: avatarUrl }))
  }

  const handleBioChange = (e) => {
    const bio = e.target.value
    setCurrentUser((prev) => ({ ...prev, bio }))
    setProfileUpdateMessage('')
  }

  const handleProfileUpdate = async () => {
    if (!token) return

    try {
      setIsProfileSaving(true)
      setProfileUpdateMessage('')

      const response = await fetch(`${API_BASE}/api/user/edit-profile`, {
        method: 'PUT',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bio: currentUser.bio })
      })

      const data = await response.json()

      if (!response.ok) {
        setProfileUpdateMessage(data?.message || 'Unable to update profile')
        return
      }

      if (data?.token) {
        setToken(data.token)
        localStorage.setItem('token', data.token)
      }

      if (data?.user) {
        setCurrentUser((prev) => ({
          ...prev,
          username: data.user.username || prev.username,
          email: data.user.email || prev.email,
          bio: data.user.bio || '',
          avatar: data.user.profileImg || prev.avatar
        }))
      }

      setProfileUpdateMessage('Profile updated')
    } catch (error) {
      setProfileUpdateMessage('Unable to update profile')
      console.error('Profile update failed:', error)
    } finally {
      setIsProfileSaving(false)
    }
  }

  const handleUserSearch = async (e) => {
    e.preventDefault()
    const query = searchQuery.trim()

    if (!query) {
      setSearchResults([])
      setSearchError('')
      return
    }

    try {
      setIsSearchLoading(true)
      setSearchError('')

      const response = await fetch(
        `${API_BASE}/api/user/search?username=${encodeURIComponent(query)}`,
        {
          headers: authHeaders
        }
      )

      const data = await response.json()
      if (!response.ok) {
        setSearchError(data?.message || 'Unable to search users')
        setSearchResults([])
        return
      }

      setSearchResults(data.users || [])
    } catch (error) {
      setSearchError('Unable to search users')
      setSearchResults([])
      console.error('User search failed:', error)
    } finally {
      setIsSearchLoading(false)
    }
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setToken('')
    localStorage.removeItem('token')
    setActivePage('feed')
    setPassword('')
    setSearchQuery('')
    setSearchResults([])
    setSearchError('')
  }

  const handleDeleteAccount = () => {
    setLoggedIn(false)
    setToken('')
    localStorage.removeItem('token')
    setActivePage('feed')
    setCurrentUser({ username: '', email: '', bio: '', avatar: '' })
    setEmail('')
    setPassword('')
    setSignupUsername('')
    setPosts([])
    setProfileStats({ followersCount: 0, followeesCount: 0 })
    setLikes({})
    setFollowing({})
    setSearchQuery('')
    setSearchResults([])
    setSearchError('')
  }

  const ownPosts = posts.filter((post) => post.username === currentUser.username)
  const totalLikesOnOwnPosts = ownPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0)

  return (
    <div className={loggedIn ? 'page logged-in' : 'page'}>
      <div className="bg-glow" aria-hidden="true">
        <span className="bg-star star-lg s1" />
        <span className="bg-star star-sm s2" />
        <span className="bg-star star-sm s3" />
        <span className="bg-star star-lg s4" />
        <span className="bg-star star-sm s5" />
        <span className="bg-star star-sm s6" />
        <span className="bg-star star-lg s7" />
        <span className="bg-star star-sm s8" />
        <span className="bg-star star-sm s9" />
        <span className="bg-star star-lg s10" />
        <span className="bg-star star-sm s11" />
        <span className="bg-star star-sm s12" />
        <span className="bg-star star-xl star-pink s13" />
        <span className="bg-star star-xl star-green s14" />
        <span className="bg-star star-xl star-blue s15" />
        <span className="bg-star star-xl star-yellow s16" />
        <span className="bg-star star-md s17" />
        <span className="bg-star star-md s18" />
        <span className="bg-star star-md s19" />
        <span className="bg-star star-md s20" />
        <span className="bg-star star-lg star-pink s21" />
        <span className="bg-star star-lg star-green s22" />
        <span className="bg-star star-lg star-blue s23" />
        <span className="bg-star star-lg star-yellow s24" />
        <span className="bg-star star-sm s25" />
        <span className="bg-star star-sm s26" />
        <span className="bg-star star-xl star-pink s27" />
        <span className="bg-star star-xl star-green s28" />
        <span className="bg-star star-xl star-blue s29" />
        <span className="bg-star star-xl star-yellow s30" />
      </div>
      {!loggedIn ? (
        <section className="card auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={authMode === 'login' ? 'tab active' : 'tab'}
              onClick={() => setAuthMode('login')}
              aria-label="Login"
            >
              <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 9V7a5 5 0 0 0-10 0v2H6.5A1.5 1.5 0 0 0 5 10.5v8A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 17.5 9zm-8.5 0V7a3.5 3.5 0 1 1 7 0v2z" />
              </svg>
            </button>
            <button
              type="button"
              className={authMode === 'signup' ? 'tab active' : 'tab'}
              onClick={() => setAuthMode('signup')}
              aria-label="Signup"
            >
              <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9m0 1.5c-3.3 0-6 1.72-6 3.84 0 .36.29.66.66.66h10.68c.37 0 .66-.3.66-.66C18 15.72 15.3 14 12 14m7.25-5V7.75H18V6.5h1.25V5.25h1.5V6.5H22v1.25h-1.25V9z" />
              </svg>
            </button>
          </div>

          {authMode === 'login' ? (
            <>
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" aria-label="Sign in">
                  <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14.78 5.22a.75.75 0 0 0 0 1.06L19.44 11H4.75a.75.75 0 0 0 0 1.5h14.69l-4.66 4.72a.75.75 0 0 0 1.06 1.06l5.94-6.03a.75.75 0 0 0 0-1.06l-5.94-6.03a.75.75 0 0 0-1.06 0" />
                  </svg>
                </button>
              </form>
              {authError ? <p className="post-caption">{authError}</p> : null}
            </>
          ) : (
            <>
              <form onSubmit={handleSignup}>
                <input
                  type="text"
                  placeholder="Username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" aria-label="Create account">
                  <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M11.25 4a.75.75 0 0 1 1.5 0v6.25H19a.75.75 0 0 1 0 1.5h-6.25V18a.75.75 0 0 1-1.5 0v-6.25H5a.75.75 0 0 1 0-1.5h6.25z" />
                  </svg>
                </button>
              </form>
              {authError ? <p className="post-caption">{authError}</p> : null}
            </>
          )}
        </section>
      ) : (
        <>
          <main className="feed page-content">
            {activePage === 'feed' ? (
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
                    const postUsername = post.username || 'unknown'
                    const isExpanded = Boolean(expandedPosts[postId])

                    return (
                      <article className="card post" key={postId}>
                      <div className="post-head">
                        <strong className="user-chip">@{postUsername}</strong>
                        <button
                          className="ghost-btn icon-btn"
                          onClick={() => toggleFollow(postUsername)}
                          aria-label={following[postUsername] ? 'Following' : 'Follow'}
                        >
                          {following[postUsername] ? (
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
                        onClick={() => togglePostSize(postId)}
                        aria-label={isExpanded ? 'Shrink post image' : 'Expand post image'}
                      >
                        <img className={isExpanded ? 'post-media expanded' : 'post-media'} src={post.image} alt={post.caption} />
                      </button>

                      <div className="post-actions">
                        <button
                          className="ghost-btn icon-btn"
                          onClick={() => toggleLike(postId)}
                          aria-label={likes[postId] ? 'Unlike' : 'Like'}
                        >
                          {likes[postId] ? (
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
                          onClick={() => toggleComments(postId)}
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

                    {commentsOpenByPost[postId] ? (
                      <div className="comments-wrap">
                        {commentsLoadingByPost[postId] ? (
                          <p className="post-caption comments-loading">Loading comments...</p>
                        ) : (
                          <>
                            {(commentsByPost[postId] || []).length === 0 ? (
                              <p className="post-caption comments-empty">No comments yet</p>
                            ) : (
                              <div className="comments-list">
                                {(commentsByPost[postId] || []).map((comment) => (
                                  <p className="post-caption comment-item" key={comment._id}>
                                    <span className="comment-user">@{comment.user}</span>: {comment.text}{' '}
                                  {comment.user === currentUser.username ? (
                                    <button
                                      type="button"
                                      className="ghost-btn comment-delete-btn"
                                      onClick={() => deleteComment(postId, comment._id)}
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
                                value={commentInputByPost[postId] || ''}
                                onChange={(e) => handleCommentInputChange(postId, e.target.value)}
                              />
                              <button
                                type="button"
                                className="comment-post-btn"
                                onClick={() => addComment(postId)}
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
                  })}
                </div>
                {actionError ? <p className="post-caption">{actionError}</p> : null}
              </>
            ) : activePage === 'search' ? (
              <>
                <section className="card user-search-card">
                  <form className="user-search-form" onSubmit={handleUserSearch}>
                    <input
                      type="text"
                      placeholder="Search user by username"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                            {username !== currentUser.username ? (
                              <button
                                className="ghost-btn"
                                onClick={() => toggleFollow(username)}
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
              </>
            ) : activePage === 'upload' ? (
              <>
                <section className="card upload-card">
                  <form onSubmit={handleUploadPost}>
                    <input
                      type="text"
                      placeholder="Write a caption"
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                    />
                    <label className="file-label icon-only" aria-label="Choose post image">
                      <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 4.75H5A2.25 2.25 0 0 0 2.75 7v10A2.25 2.25 0 0 0 5 19.25h14A2.25 2.25 0 0 0 21.25 17V7A2.25 2.25 0 0 0 19 4.75M12 8.25a.75.75 0 0 1 .75.75v2.25H15a.75.75 0 0 1 0 1.5h-2.25V15a.75.75 0 0 1-1.5 0v-2.25H9a.75.75 0 0 1 0-1.5h2.25V9a.75.75 0 0 1 .75-.75" />
                      </svg>
                      <input
                        className="file-input-hidden"
                        type="file"
                        accept="image/*"
                        onChange={handleImagePick}
                      />
                    </label>
                    {uploadPreview ? <img src={uploadPreview} alt="Upload preview" /> : null}
                    <button type="submit" aria-label="Publish post">
                      <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19.6 3.2 3.9 9.48a1 1 0 0 0 .08 1.89l5.3 1.73 1.74 5.3a1 1 0 0 0 1.89.08L20.8 4.4a1 1 0 0 0-1.2-1.2m-7.62 13.38-1.08-3.3a1.75 1.75 0 0 0-1.12-1.12l-3.3-1.08 10.62-4.25z" />
                      </svg>
                    </button>
                  </form>
                  {uploadError ? <p className="post-caption">{uploadError}</p> : null}
                </section>
              </>
            ) : (
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
                        onChange={handleAvatarPick}
                      />
                    </label>

                    <label aria-label="Bio">
                      <textarea
                        placeholder="Write your bio"
                        value={currentUser.bio}
                        onChange={handleBioChange}
                        rows={3}
                      />
                    </label>

                    <button
                      type="button"
                      className="profile-save-btn"
                      onClick={handleProfileUpdate}
                      aria-label="Update bio"
                      disabled={isProfileSaving}
                    >
                      {isProfileSaving ? 'Updating...' : 'Update Bio'}
                    </button>

                    {profileUpdateMessage ? <p className="post-caption">{profileUpdateMessage}</p> : null}
                  </div>

                  <div className="profile-actions">
                    <button type="button" onClick={handleLogout} aria-label="Logout">
                      <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M10 4.75A.75.75 0 0 1 10.75 4h6.75c1.1 0 2 .9 2 2v12a2 2 0 0 1-2 2h-6.75a.75.75 0 0 1 0-1.5h6.75a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5h-6.75A.75.75 0 0 1 10 4.75m2.03 7.78-2.5-2.5a.75.75 0 1 0-1.06 1.06l1.22 1.22H4.75a.75.75 0 0 0 0 1.5h4.94l-1.22 1.22a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06" />
                      </svg>
                    </button>
                    <button type="button" className="danger-btn" onClick={handleDeleteAccount} aria-label="Delete account">
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
            )}
          </main>

          <nav className="bottom-nav" aria-label="Primary">
            <button
              type="button"
              className={activePage === 'feed' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActivePage('feed')}
              aria-label="Feed"
            >
              <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 11.5 12 4l9 7.5v8a1 1 0 0 1-1 1h-5.5a.5.5 0 0 1-.5-.5V15a2 2 0 0 0-4 0v5a.5.5 0 0 1-.5.5H4a1 1 0 0 1-1-1z" />
              </svg>
            </button>
            <button
              type="button"
              className={activePage === 'search' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActivePage('search')}
              aria-label="Search"
            >
              <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 4.75a5.25 5.25 0 1 0 3.34 9.29l4.3 4.3a.75.75 0 1 0 1.06-1.06l-4.3-4.3A5.25 5.25 0 0 0 10 4.75m-3.75 5.25a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0" />
              </svg>
            </button>
            <button
              type="button"
              className={activePage === 'upload' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActivePage('upload')}
              aria-label="Upload"
            >
              <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 4.75H5A2.25 2.25 0 0 0 2.75 7v10A2.25 2.25 0 0 0 5 19.25h14A2.25 2.25 0 0 0 21.25 17V7A2.25 2.25 0 0 0 19 4.75M12 8.25a.75.75 0 0 1 .75.75v2.25H15a.75.75 0 0 1 0 1.5h-2.25V15a.75.75 0 0 1-1.5 0v-2.25H9a.75.75 0 0 1 0-1.5h2.25V9a.75.75 0 0 1 .75-.75" />
              </svg>
            </button>
            <button
              type="button"
              className={activePage === 'profile' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActivePage('profile')}
              aria-label="Profile"
            >
              <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12.75a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5m0 1.5c-4.2 0-7.5 2.05-7.5 4.67 0 .46.37.83.83.83h13.34c.46 0 .83-.37.83-.83 0-2.62-3.3-4.67-7.5-4.67" />
              </svg>
            </button>
          </nav>
        </>
      )}
    </div>
  )
}

export default App
