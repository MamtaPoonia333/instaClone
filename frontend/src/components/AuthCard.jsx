// Login/signup card. Pure presentational component — all form state
// and submit handlers live in App.jsx and are passed down as props.
function AuthCard({
  authMode,
  onChangeAuthMode,
  email,
  onChangeEmail,
  password,
  onChangePassword,
  signupUsername,
  onChangeSignupUsername,
  authError,
  onLogin,
  onSignup
}) {
  return (
    <section className="card auth-card">
      <div className="auth-tabs">
        <button
          type="button"
          className={authMode === 'login' ? 'tab active' : 'tab'}
          onClick={() => onChangeAuthMode('login')}
          aria-label="Login"
        >
          <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 9V7a5 5 0 0 0-10 0v2H6.5A1.5 1.5 0 0 0 5 10.5v8A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 17.5 9zm-8.5 0V7a3.5 3.5 0 1 1 7 0v2z" />
          </svg>
        </button>
        <button
          type="button"
          className={authMode === 'signup' ? 'tab active' : 'tab'}
          onClick={() => onChangeAuthMode('signup')}
          aria-label="Signup"
        >
          <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9m0 1.5c-3.3 0-6 1.72-6 3.84 0 .36.29.66.66.66h10.68c.37 0 .66-.3.66-.66C18 15.72 15.3 14 12 14m7.25-5V7.75H18V6.5h1.25V5.25h1.5V6.5H22v1.25h-1.25V9z" />
          </svg>
        </button>
      </div>

      {authMode === 'login' ? (
        <>
          <form onSubmit={onLogin}>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => onChangeEmail(e.target.value)}
            />
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => onChangePassword(e.target.value)}
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
          <form onSubmit={onSignup}>
            <input
              id="signup-username"
              name="username"
              type="text"
              placeholder="Username"
              value={signupUsername}
              onChange={(e) => onChangeSignupUsername(e.target.value)}
            />
            <input
              id="signup-email"
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => onChangeEmail(e.target.value)}
            />
            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => onChangePassword(e.target.value)}
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
  )
}

export default AuthCard
