import { OpenAPIHono } from '@hono/zod-openapi';

export const app = new OpenAPIHono();

// Add OpenAPI documentation
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '0.1.0',
    title: '__PROJECT_NAME__ API',
    description: 'API documentation for __PROJECT_NAME__',
  },
  servers: [
    {
      url: 'http://localhost:__API_PORT__',
      description: 'Development server',
    },
  ],
});
