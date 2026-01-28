# Video Generator Backend

Backend API for AI-powered explainer video generation platform.

## Features

- **User Authentication**: JWT-based auth + Keycloak support (OAuth2/OIDC)
- **Project Management**: Create, read, update, delete video projects
- **Scene Management**: Organize projects into multiple scenes
- **Video Generation**: Queue videos using Google Veo 3
- **Voice-over**: Generate speech using Google Cloud Text-to-Speech
- **Usage Metering**: Track API usage with subscription-based quotas
- **Sharing**: Share projects with other users
- **Video Compilation**: Combine scenes into final MP4 videos

## Project Structure

```
src/
├── config.js              # Configuration management
├── index.js               # Main server entry point
├── models/                # MongoDB models
│   ├── User.js
│   ├── Project.js
│   ├── Scene.js
│   └── VideoGenerationJob.js
├── services/              # Business logic
│   ├── userService.js
│   ├── projectService.js
│   ├── videoGenerationService.js
│   ├── googleVideoService.js
│   ├── googleTTSService.js
│   ├── keycloakService.js
│   └── usageMetricsService.js
├── controllers/           # Route handlers
│   ├── authController.js
│   ├── keycloakController.js
│   ├── projectController.js
│   └── videoController.js
├── routes/                # API routes
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   └── videoRoutes.js
├── middleware/            # Custom middleware
│   └── auth.js
└── config/                # Configuration
    └── keycloak.js
```

## API Endpoints

### Authentication (JWT-based)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `GET /api/auth/quota` - Get usage quota

### Authentication (Keycloak-based)
- `POST /api/auth/keycloak/register` - Register with Keycloak
- `POST /api/auth/keycloak/login` - Login with Keycloak
- `POST /api/auth/keycloak/refresh-token` - Refresh access token
- `POST /api/auth/keycloak/logout` - Logout and revoke tokens
- `GET /api/auth/keycloak/user-info` - Get Keycloak user info

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List user's projects
- `GET /api/projects/:projectId` - Get project details
- `PUT /api/projects/:projectId` - Update project
- `DELETE /api/projects/:projectId` - Delete project
- `POST /api/projects/:projectId/share` - Share project
- `GET /api/projects/share/:shareToken` - Get shared project

### Scenes
- `POST /api/projects/:projectId/scenes` - Add scene
- `PUT /api/projects/scenes/:sceneId` - Update scene
- `DELETE /api/projects/scenes/:sceneId` - Delete scene
- `POST /api/projects/:projectId/reorder-scenes` - Reorder scenes

### Videos
- `POST /api/videos/generate-video` - Queue video generation
- `POST /api/videos/generate-voiceover` - Generate voice-over
- `GET /api/videos/job/:jobId` - Get job status
- `POST /api/videos/compile/:projectId` - Compile project
- `GET /api/videos/download/:projectId` - Download video

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/videogen

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Google Cloud
GOOGLE_API_KEY=your_google_api_key
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_CLIENT_EMAIL=your_client_email
GOOGLE_PRIVATE_KEY=your_private_key

# Keycloak (Optional)
KEYCLOAK_AUTH_SERVER_URL=https://your-keycloak-instance.com/auth
KEYCLOAK_REALM=videogen
KEYCLOAK_CLIENT_ID=videogen-api
KEYCLOAK_CLIENT_SECRET=your_client_secret

# Storage
UPLOAD_DIR=uploads
```

See `.env.example` for detailed configuration instructions.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with the variables above

3. Start development server:
```bash
npm run dev
```

Or start production server:
```bash
npm start
```

## API Documentation

### Interactive Swagger UI
After starting the server, visit:
```
http://localhost:5000/api-docs
```

Features:
- Full API endpoint documentation with schemas
- Interactive request/response testing
- Authentication token management
- All available parameters and options
- Real-time API testing

### Additional Documentation Files

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Comprehensive API reference with examples
- [POSTMAN_COLLECTION.md](POSTMAN_COLLECTION.md) - Postman collection setup guide
- [examples.sh](examples.sh) - Bash script with example API calls

### Quick API Examples

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Create project
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Video Project"
  }'

# Add scene
curl -X POST http://localhost:5000/api/projects/<projectId>/scenes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Scene 1",
    "script": "Scene content here"
  }'

# Generate video
curl -X POST http://localhost:5000/api/videos/generate-video \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sceneId": "<sceneId>",
    "projectId": "<projectId>",
    "quality": "standard"
  }'
```

## Authentication

The backend supports two authentication methods:

### 1. JWT-based Authentication (Simple Setup)
Uses traditional JWT tokens for stateless authentication. Good for development and simple deployments.

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Keycloak Authentication (Enterprise Setup)
Uses Keycloak for centralized identity management with OAuth2/OpenID Connect. Recommended for production.

**Prerequisites:**
1. Deploy Keycloak (Docker, self-hosted, or managed service)
2. Set environment variables for Keycloak configuration
3. Create a realm and client in Keycloak

**Keycloak Login:**
```bash
curl -X POST http://localhost:5000/api/auth/keycloak/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123"
  }'

# Returns: { accessToken, refreshToken, expiresIn }
```

**Keycloak Register:**
```bash
curl -X POST http://localhost:5000/api/auth/keycloak/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Refresh Token:**
```bash
curl -X POST http://localhost:5000/api/auth/keycloak/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token"
  }'
```

**Logout:**
```bash
curl -X POST http://localhost:5000/api/auth/keycloak/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token"
  }'
```

The auth middleware automatically detects and validates both token types.

## Database Models

### User
- email, password, firstName, lastName
- subscription (free/pro/premium)
- apiQuota, apiUsage tracking

### Project
- userId, title, description
- videoSettings (quality, resolution, aspect ratio)
- scenes array, finalVideoUrl
- sharing configuration

### Scene
- projectId, order, title, script
- videoUrl, videoStatus
- voiceOverUrl, voiceOverStatus
- stylePreset, transitionType

### VideoGenerationJob
- userId, projectId, sceneId
- status, googleJobId
- processing timestamps, retry logic

## Usage Example

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Video",
    "description": "An explainer video",
    "videoSettings": {
      "quality": "standard",
      "resolution": "1080p"
    }
  }'
```

### 3. Add Scene
```bash
curl -X POST http://localhost:5000/api/projects/{projectId}/scenes \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Scene 1",
    "script": "This is an explainer about...",
    "voiceSettings": {
      "enabled": true,
      "voice": "en-US-Neural2-A"
    }
  }'
```

### 4. Generate Video
```bash
curl -X POST http://localhost:5000/api/videos/generate-video \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "sceneId": "{sceneId}",
    "projectId": "{projectId}",
    "quality": "standard"
  }'
```

## Google Cloud Integration

The backend integrates with:
- **Google Veo 3** for video generation via Gemini API
- **Google Cloud Text-to-Speech** for voice narration
- **Google Cloud Storage** (or S3) for media storage

## License

MIT
