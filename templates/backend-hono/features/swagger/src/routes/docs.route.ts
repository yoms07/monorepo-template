import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';

const docs = new OpenAPIHono();

// Scalar UI for API documentation
docs.get(
  '/',
  apiReference({
    spec: {
      url: '/openapi.json',
    },
    theme: 'purple',
    layout: 'modern',
  })
);

export { docs };
