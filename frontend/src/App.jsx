import { useEffect, useState } from 'react'
import { API_BASE } from './api/config'
import Background from './components/Background'
import AuthCard from './components/AuthCard'
import FeedPage from './components/FeedPage'
import SearchPage from './components/SearchPage'
import UploadPage from './components/UploadPage'
import ProfilePage from './components/ProfilePage'
import BottomNav from './components/BottomNav'

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
      <Background />

      {!loggedIn ? (
        <AuthCard
          authMode={authMode}
          onChangeAuthMode={setAuthMode}
          email={email}
          onChangeEmail={setEmail}
          password={password}
          onChangePassword={setPassword}
          signupUsername={signupUsername}
          onChangeSignupUsername={setSignupUsername}
          authError={authError}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      ) : (
        <>
          <main className="feed page-content">
            {activePage === 'feed' ? (
              <FeedPage
                posts={posts}
                expandedPosts={expandedPosts}
                following={following}
                likes={likes}
                commentsOpenByPost={commentsOpenByPost}
                commentsLoadingByPost={commentsLoadingByPost}
                commentsByPost={commentsByPost}
                commentInputByPost={commentInputByPost}
                currentUsername={currentUser.username}
                actionError={actionError}
                onToggleFollow={toggleFollow}
                onTogglePostSize={togglePostSize}
                onToggleLike={toggleLike}
                onToggleComments={toggleComments}
                onCommentInputChange={handleCommentInputChange}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
              />
            ) : activePage === 'search' ? (
              <SearchPage
                searchQuery={searchQuery}
                onChangeSearchQuery={setSearchQuery}
                onSearch={handleUserSearch}
                isSearchLoading={isSearchLoading}
                searchError={searchError}
                searchResults={searchResults}
                following={following}
                currentUsername={currentUser.username}
                onToggleFollow={toggleFollow}
              />
            ) : activePage === 'upload' ? (
              <UploadPage
                uploadCaption={uploadCaption}
                onChangeUploadCaption={setUploadCaption}
                uploadPreview={uploadPreview}
                uploadError={uploadError}
                onImagePick={handleImagePick}
                onSubmit={handleUploadPost}
              />
            ) : (
              <ProfilePage
                currentUser={currentUser}
                profileStats={profileStats}
                ownPosts={ownPosts}
                totalLikesOnOwnPosts={totalLikesOnOwnPosts}
                onAvatarPick={handleAvatarPick}
                onBioChange={handleBioChange}
                onProfileUpdate={handleProfileUpdate}
                isProfileSaving={isProfileSaving}
                profileUpdateMessage={profileUpdateMessage}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
              />
            )}
          </main>

          <BottomNav activePage={activePage} onChangePage={setActivePage} />
        </>
      )}
    </div>
  )
}

export default App
