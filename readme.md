# InstaClone Backend Flow

This project is an Express + MongoDB backend with two main modules:

- Auth (`/api/auth`)
- Post upload (`/api/post`)

## 1) App Startup Flow

```mermaid
flowchart TD
	A[server.js starts] --> B[Load env with dotenv]
	B --> C[Create app from src/app.js]
	C --> D[connectDb from src/config/database.js]
	D --> E[Mongoose connects to MONGO_URI or MONGO_URL]
	E --> F[app.listen on port 3000]
```

## 2) Request Routing Flow

```mermaid
flowchart LR
	A[Client Request] --> B[Express JSON + cookie-parser middleware]
	B --> C{Route Prefix}
	C -->|/api/auth| D[src/routes/auth.route.js]
	C -->|/api/post| E[src/routes/post.route.js]

	D --> F[POST /signup -> registerController]
	D --> G[POST /login -> loginController]

	E --> H[multer memoryStorage + uploadImage.single(image)]
	H --> I[POST /upload -> createPostController]
```

## 3) Auth Flow (Signup/Login)

```mermaid
flowchart TD
	A[POST /api/auth/signup] --> B[registerController]
	B --> C[Check existing user by email/username]
	C -->|exists| D[409 conflict]
	C -->|not exists| E[Hash password with sha256]
	E --> F[Create and save user in MongoDB]
	F --> G[Sign JWT with JWT_SECRET]
	G --> H[Set token cookie]
	H --> I[201 success + user data]
```

```mermaid
flowchart TD
	A[POST /api/auth/login] --> B[loginController]
	B --> C[Find user by email]
	C -->|not found| D[404 user not found]
	C -->|found| E[Hash incoming password with sha256]
	E --> F{hash matches stored password?}
	F -->|no| G[401 invalid password]
	F -->|yes| H[Sign JWT with JWT_SECRET]
	H --> I[Set token cookie]
	I --> J[200 login success + user data]
```

## 4) Post Upload Flow

```mermaid
flowchart TD
	A[POST /api/post/upload with image] --> B[multer stores file in memory]
	B --> C[createPostController]
	C --> D[imagekit.files.upload]
	D --> E[Send ImageKit upload response]
```

## 5) Data Layer

- `users` collection (`src/models/user.model.js`): username, email, hashed password, bio, profile image.
- `posts` collection (`src/models/post.model.js`): caption, image URL, user reference, time.

Note: current `createPostController` uploads the image to ImageKit and returns the upload result, but it does not yet save a post document using `postModel`.
