import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Video Generator API',
      version: '1.0.0',
      description: 'REST API for AI-powered explainer video generation platform',
      contact: {
        name: 'Support',
        url: 'https://example.com/support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.bolt-video.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from login endpoint',
        },
      },
      schemas: {
        // Auth Schemas
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        KeycloakLoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    subscription: {
                      type: 'string',
                      enum: ['free', 'pro', 'premium'],
                    },
                  },
                },
                token: { type: 'string' },
              },
            },
          },
        },
        KeycloakAuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    keycloakId: { type: 'string' },
                  },
                },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    expiresIn: { type: 'number' },
                  },
                },
              },
            },
          },
        },
        // Project Schemas
        ProjectRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            template: { type: 'string' },
            videoSettings: {
              type: 'object',
              properties: {
                quality: {
                  type: 'string',
                  enum: ['fast', 'standard', 'high'],
                },
                aspectRatio: {
                  type: 'string',
                  enum: ['16:9', '9:16', '1:1'],
                },
                resolution: {
                  type: 'string',
                  enum: ['720p', '1080p', '4k'],
                },
              },
            },
          },
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: {
              type: 'string',
              enum: ['draft', 'generating', 'completed', 'failed'],
            },
            scenes: {
              type: 'array',
              items: { type: 'string' },
            },
            finalVideoUrl: { type: 'string' },
            totalDuration: { type: 'number' },
            viewCount: { type: 'number' },
            downloadCount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // Scene Schemas
        SceneRequest: {
          type: 'object',
          required: ['script'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            script: { type: 'string' },
            duration: { type: 'number' },
            stylePreset: {
              type: 'string',
              enum: ['minimal', 'corporate', 'playful', 'professional', 'tech'],
            },
            voiceSettings: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' },
                voice: {
                  type: 'string',
                  enum: [
                    'en-US-Neural2-A',
                    'en-US-Neural2-C',
                    'en-US-Neural2-E',
                  ],
                },
                speed: { type: 'number', minimum: 0.5, maximum: 2.0 },
              },
            },
          },
        },
        Scene: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            projectId: { type: 'string' },
            order: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            script: { type: 'string' },
            duration: { type: 'number' },
            videoUrl: { type: 'string' },
            videoStatus: {
              type: 'string',
              enum: ['pending', 'generating', 'completed', 'failed'],
            },
            voiceOverUrl: { type: 'string' },
            voiceOverStatus: {
              type: 'string',
              enum: ['pending', 'generating', 'completed', 'failed'],
            },
            stylePreset: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // Video Generation Schemas
        VideoGenerationRequest: {
          type: 'object',
          required: ['sceneId', 'projectId'],
          properties: {
            sceneId: { type: 'string' },
            projectId: { type: 'string' },
            quality: {
              type: 'string',
              enum: ['fast', 'standard', 'high'],
            },
            resolution: {
              type: 'string',
              enum: ['720p', '1080p', '4k'],
            },
            aspectRatio: {
              type: 'string',
              enum: ['16:9', '9:16', '1:1'],
            },
          },
        },
        VoiceOverRequest: {
          type: 'object',
          required: ['sceneId', 'projectId'],
          properties: {
            sceneId: { type: 'string' },
            projectId: { type: 'string' },
          },
        },
        JobStatus: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            status: {
              type: 'string',
              enum: ['queued', 'processing', 'completed', 'failed'],
            },
            progress: { type: 'number', minimum: 0, maximum: 100 },
            estimatedTimeRemaining: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // Quota & Analytics
        QuotaInfo: {
          type: 'object',
          properties: {
            subscription: {
              type: 'string',
              enum: ['free', 'pro', 'premium'],
            },
            monthlyQuota: {
              type: 'object',
              properties: {
                videos: { type: 'number' },
                voiceOvers: { type: 'number' },
              },
            },
            usage: {
              type: 'object',
              properties: {
                videosThisMonth: { type: 'number' },
                voiceOversThisMonth: { type: 'number' },
                lastReset: { type: 'string', format: 'date-time' },
              },
            },
            remainingQuota: {
              type: 'object',
              properties: {
                videos: { type: 'number' },
                voiceOvers: { type: 'number' },
              },
            },
          },
        },
        // Error Response
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
