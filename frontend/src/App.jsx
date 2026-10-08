import { useEffect, useState } from 'react'
import { API_BASE } from './api/config'
import Background from './components/Background'
import AuthCard from './components/AuthCard'
import FeedPage from './components/FeedPage'
import ReelsPage from './components/ReelsPage'
import SearchPage from './components/SearchPage'
import UploadPage from './components/UploadPage'
import ProfilePage from './components/ProfilePage'
import BottomNav from './components/BottomNav'
import AllChats from './components/AllChats'
import Chat from './components/Chat'

const savedPage = localStorage.getItem('activePage')
const validPages = ['feed', 'reels', 'search', 'upload', 'chats', 'profile']
const savedUser = localStorage.getItem('currentUser')

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [authMode, setAuthMode] = useState('login')
  const [signupUsername, setSignupUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem('token')))
  const [activePage, setActivePage] = useState(
    validPages.includes(savedPage) ? savedPage : 'feed'
  )
  const [currentUser, setCurrentUser] = useState({
    _id: '',
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
  const [uploadMediaFile, setUploadMediaFile] = useState(null)
  const [uploadType, setUploadType] = useState('image')
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
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [profileUpdateMessage, setProfileUpdateMessage] = useState('')
  const [conversations, setConversations] = useState([])
  const [selectedChatUser, setSelectedChatUser] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatSearchQuery, setChatSearchQuery] = useState('')
  const [chatSearchResults, setChatSearchResults] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSending, setChatSending] = useState(false)
  const [chatSearchLoading, setChatSearchLoading] = useState(false)
  const [chatError, setChatError] = useState('')

  useEffect(() => {
    if (loggedIn) {
      localStorage.setItem('activePage', activePage)
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    }
  }, [activePage, currentUser, loggedIn])

  useEffect(() => {
    if (!loggedIn || !savedUser) return
    try {
      setCurrentUser((previous) => ({ ...previous, ...JSON.parse(savedUser) }))
    } catch (error) {
      localStorage.removeItem('currentUser')
      console.error('Unable to restore saved user session:', error)
    }
  }, [loggedIn])

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  const authenticatedRequestOptions = (options = {}) => ({
    ...options,
    credentials: 'include',
    headers: {
      ...authHeaders,
      ...(options.headers || {})
    }
  })

  const handleSessionExpired = (message = 'Your session has expired. Please log in again.') => {
    setSearchError(message)
    setToken('')
    setLoggedIn(false)
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
  }

  const fetchPosts = async () => {
    if (!token) return

    try {
      const response = await fetch(
        `${API_BASE}/api/post/get`,
        authenticatedRequestOptions({
          cache: 'no-store',
          headers: { Accept: 'application/json' }
        })
      )
      const data = await response.json()
      if (!response.ok) return
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }

  }

  const fetchConversations = async () => {
    if (!token) return
    try {
      const response = await fetch(`${API_BASE}/api/messages/conversations`, { headers: authHeaders })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message || 'Unable to load chats')
      setConversations(data.conversations || [])
    } catch (error) {
      setChatError(error.message)
    }
  }

  const fetchConversation = async (user) => {
    if (!token || !user?._id) return
    setSelectedChatUser(user)
    setChatLoading(true)
    setChatError('')
    try {
      const response = await fetch(`${API_BASE}/api/messages/${user._id}`, { headers: authHeaders })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message || 'Unable to load conversation')
      if (data.currentUserId) {
        setCurrentUser((previous) => ({ ...previous, _id: data.currentUserId }))
      }
      setSelectedChatUser(data.user || user)
      setChatMessages(data.messages || [])
    } catch (error) {
      setChatError(error.message)
    } finally {
      setChatLoading(false)
    }
  }

  const searchChatUsers = async (event) => {
    event?.preventDefault()
    const query = chatSearchQuery.trim()
    if (!query || !token) return
    setChatSearchLoading(true)
    setChatError('')
    try {
      const response = await fetch(`${API_BASE}/api/user/search?username=${encodeURIComponent(query)}`, { headers: authHeaders })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message || 'Unable to search users')
      setChatSearchResults((data.users || []).filter((user) => user.username !== currentUser.username))
    } catch (error) {
      setChatError(error.message)
    } finally {
      setChatSearchLoading(false)
    }
  }

  const sendChatMessage = async (event) => {
    event.preventDefault()
    const content = chatInput.trim()
    if (!content || !selectedChatUser?._id || chatSending) return
    setChatSending(true)
    setChatError('')
    try {
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: selectedChatUser._id, content })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message || 'Unable to send message')
      setChatMessages((previous) => [...previous, data.message])
      setChatInput('')
      await fetchConversations()
    } catch (error) {
      setChatError(error.message)
    } finally {
      setChatSending(false)
    }
  }

  const openChatWithUser = async (user) => {
    setActivePage('chats')
    await fetchConversation(user)
  }

  useEffect(() => {
    if (loggedIn && token && activePage === 'chats') fetchConversations()
  }, [loggedIn, token, activePage])

  useEffect(() => {
    if (!selectedChatUser?._id || activePage !== 'chats') return undefined
    const interval = window.setInterval(() => fetchConversation(selectedChatUser), 5000)
    return () => window.clearInterval(interval)
  }, [selectedChatUser?._id, activePage, token])

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
        _id: data.user?._id || '',
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
        _id: data.user?._id || '',
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
    setUploadMediaFile(file)
    setUploadPreview(previewUrl)
  }

  const handleUploadTypeChange = (type) => {
    setUploadType(type)
    setUploadMediaFile(null)
    setUploadPreview('')
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
    if (!uploadCaption || !uploadMediaFile || !uploadPreview || !token) {
      setUploadError('Add a caption and choose an image or video first')
      return
    }

    try {
      setUploadError('')

      const formData = new FormData()
      formData.append('caption', uploadCaption)
      formData.append('media', uploadMediaFile)
      formData.append('mediaType', uploadType)

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
      setUploadMediaFile(null)
      setUploadPreview('')
      setUploadType('image')
      await fetchPosts()
      setActivePage('feed')
    } catch (error) {
      setUploadError('Unable to upload post')
      console.error('Upload failed:', error)
    }

  }

  const moveReel = (index, direction) => {
    const nextIndex = index + direction
    const reelSlides = document.querySelectorAll('.reel-slide')
    reelSlides[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
          _id: data.user._id || prev._id,
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
      setSearchError('Enter a username to search')
      setHasSearched(false)
      return
    }

    if (!token) {
      setSearchResults([])
      setSearchError('Please log in again to search users')
      setHasSearched(false)
      return
    }

    try {
      setIsSearchLoading(true)
      setSearchError('')
      setHasSearched(true)

      const response = await fetch(
        `${API_BASE}/api/user/search?username=${encodeURIComponent(query)}`,
        authenticatedRequestOptions({
          cache: 'no-store',
          headers: { Accept: 'application/json' }
        })
      )

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 401) {
          handleSessionExpired()
        } else {
          setSearchError(data?.message || `Unable to search users (${response.status})`)
        }
        setSearchResults([])
        return
      }

      if (!Array.isArray(data.users)) {
        setSearchResults([])
        setSearchError('Search returned an invalid response')
        return
      }

      setSearchResults(data.users)
    } catch (error) {
      setSearchError('Search service is unavailable. Check that the backend is running.')
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
    localStorage.removeItem('activePage')
    localStorage.removeItem('currentUser')
    setActivePage('feed')
    setPassword('')
    setSearchQuery('')
    setSearchResults([])
    setSearchError('')
    setHasSearched(false)
    setConversations([])
    setSelectedChatUser(null)
    setChatMessages([])
    setChatInput('')
    setChatSearchQuery('')
    setChatSearchResults([])
    setChatError('')
  }

  const handleDeleteAccount = () => {
    setLoggedIn(false)
    setToken('')
    localStorage.removeItem('token')
    localStorage.removeItem('activePage')
    localStorage.removeItem('currentUser')
    setActivePage('feed')
    setCurrentUser({ _id: '', username: '', email: '', bio: '', avatar: '' })
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
    setHasSearched(false)
    setConversations([])
    setSelectedChatUser(null)
    setChatMessages([])
    setChatInput('')
    setChatSearchQuery('')
    setChatSearchResults([])
    setChatError('')
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
            ) : activePage === 'reels' ? (
              <ReelsPage
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
                onMoveReel={moveReel}
              />
            ) : activePage === 'search' ? (
              <SearchPage
                searchQuery={searchQuery}
                onChangeSearchQuery={setSearchQuery}
                onSearch={handleUserSearch}
                isSearchLoading={isSearchLoading}
                searchError={searchError}
                searchResults={searchResults}
                hasSearched={hasSearched}
                following={following}
                currentUsername={currentUser.username}
                onToggleFollow={toggleFollow}
                onMessageUser={openChatWithUser}
              />
            ) : activePage === 'upload' ? (
              <UploadPage
                uploadCaption={uploadCaption}
                onChangeUploadCaption={setUploadCaption}
                uploadType={uploadType}
                onChangeUploadType={handleUploadTypeChange}
                uploadPreview={uploadPreview}
                uploadError={uploadError}
                onMediaPick={handleImagePick}
                onSubmit={handleUploadPost}
              />
            ) : activePage === 'chats' ? (
              <div className={selectedChatUser ? 'chat-page with-conversation' : 'chat-page'}>
                <AllChats
                  conversations={conversations}
                  selectedUser={selectedChatUser}
                  searchQuery={chatSearchQuery}
                  searchResults={chatSearchResults}
                  isSearchLoading={chatSearchLoading}
                  error={chatError}
                  onChangeSearchQuery={setChatSearchQuery}
                  onSearch={searchChatUsers}
                  onSelectConversation={fetchConversation}
                />
                <Chat
                  user={selectedChatUser}
                  messages={chatMessages}
                  currentUserId={currentUser._id}
                  input={chatInput}
                  loading={chatLoading}
                  sending={chatSending}
                  error={chatError}
                  onChangeInput={setChatInput}
                  onSend={sendChatMessage}
                  onBack={() => setSelectedChatUser(null)}
                />
              </div>
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

          <BottomNav
            activePage={activePage}
            onChangePage={(page) => {
              setActivePage(page)
              localStorage.setItem('activePage', page)
            }}
          />
        </>
      )}
    </div>
  )
}

export default App
