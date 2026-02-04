import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecommerce API',
      version: '1.0.0',
      description: 'API documentation for Ecommerce Backend'
    },
    servers: [
      {
        url: 'http://localhost:8000/api',
        description: 'Local server'
      }
    ]
  },
  apis: ['./routes/*.ts'] // Adjust path to your routes files
};

const specs = swaggerJsdoc(options);
export default specs;
