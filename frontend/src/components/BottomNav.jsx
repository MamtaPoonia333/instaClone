// Bottom tab bar for switching between feed / reels / search / upload / profile.
function BottomNav({ activePage, onChangePage }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <button
        type="button"
        className={activePage === 'chats' ? 'nav-btn active' : 'nav-btn'}
        onClick={() => onChangePage('chats')}
        aria-label="Chats"
      >
        <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.5 4.75h13A2.75 2.75 0 0 1 21.25 7.5v7A2.75 2.75 0 0 1 18.5 17.25H11l-4.4 3.25a.75.75 0 0 1-1.2-.6v-2.65a2.75 2.75 0 0 1-2.65-2.75v-7A2.75 2.75 0 0 1 5.5 4.75m0 1.5c-.69 0-1.25.56-1.25 1.25v7c0 .69.56 1.25 1.25 1.25h1.4v1.66l3.2-2.36h8.4c.69 0 1.25-.56 1.25-1.25v-7c0-.69-.56-1.25-1.25-1.25z" />
        </svg>
      </button>
      <button
        type="button"
        className={activePage === 'reels' ? 'nav-btn active' : 'nav-btn'}
        onClick={() => onChangePage('reels')}
        aria-label="Reels"
      >
        <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3.75h10A3.25 3.25 0 0 1 20.25 7v10A3.25 3.25 0 0 1 17 20.25H7A3.25 3.25 0 0 1 3.75 17V7A3.25 3.25 0 0 1 7 3.75m0 1.5A1.75 1.75 0 0 0 5.25 7v10c0 .97.78 1.75 1.75 1.75h10A1.75 1.75 0 0 0 18.75 17V7A1.75 1.75 0 0 0 17 5.25zm2.5 2.5 6 4.25-6 4.25z" />
        </svg>
      </button>
      <button
        type="button"
        className={activePage === 'feed' ? 'nav-btn active' : 'nav-btn'}
        onClick={() => onChangePage('feed')}
        aria-label="Feed"
      >
        <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 11.5 12 4l9 7.5v8a1 1 0 0 1-1 1h-5.5a.5.5 0 0 1-.5-.5V15a2 2 0 0 0-4 0v5a.5.5 0 0 1-.5.5H4a1 1 0 0 1-1-1z" />
        </svg>
      </button>
      <button
        type="button"
        className={activePage === 'search' ? 'nav-btn active' : 'nav-btn'}
        onClick={() => onChangePage('search')}
        aria-label="Search"
      >
        <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 4.75a5.25 5.25 0 1 0 3.34 9.29l4.3 4.3a.75.75 0 1 0 1.06-1.06l-4.3-4.3A5.25 5.25 0 0 0 10 4.75m-3.75 5.25a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0" />
        </svg>
      </button>
      <button
        type="button"
        className={activePage === 'upload' ? 'nav-btn active' : 'nav-btn'}
        onClick={() => onChangePage('upload')}
        aria-label="Upload"
      >
        <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 4.75H5A2.25 2.25 0 0 0 2.75 7v10A2.25 2.25 0 0 0 5 19.25h14A2.25 2.25 0 0 0 21.25 17V7A2.25 2.25 0 0 0 19 4.75M12 8.25a.75.75 0 0 1 .75.75v2.25H15a.75.75 0 0 1 0 1.5h-2.25V15a.75.75 0 0 1-1.5 0v-2.25H9a.75.75 0 0 1 0-1.5h2.25V9a.75.75 0 0 1 .75-.75" />
        </svg>
      </button>
      <button
        type="button"
        className={activePage === 'profile' ? 'nav-btn active' : 'nav-btn'}
        onClick={() => onChangePage('profile')}
        aria-label="Profile"
      >
        <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12.75a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5m0 1.5c-4.2 0-7.5 2.05-7.5 4.67 0 .46.37.83.83.83h13.34c.46 0 .83-.37.83-.83 0-2.62-3.3-4.67-7.5-4.67" />
        </svg>
      </button>
    </nav>
  )
}

export default BottomNav
