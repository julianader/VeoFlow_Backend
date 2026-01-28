import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Google Cloud
  googleProjectId: process.env.GOOGLE_PROJECT_ID,
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Storage
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  
  // API Limits
  maxVideoLength: 120000, // 2 minutes in seconds
  minVideoLength: 15000, // 15 seconds
  maxScenes: 10,
  maxProjects: 50,
  
  // Keycloak
  keycloakEnabled: !!process.env.KEYCLOAK_AUTH_SERVER_URL,
  keycloakAuthServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL,
  keycloakRealm: process.env.KEYCLOAK_REALM || 'videogen',
  keycloakClientId: process.env.KEYCLOAK_CLIENT_ID,
  keycloakClientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
};
