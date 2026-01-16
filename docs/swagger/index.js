const swaggerJsdoc = require('swagger-jsdoc');
const components = require('./components');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'AuthWay API',
      version: '1.0.0',
      description: 'Multi-tenant authentication API'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development'
      }
    ],

    components
  },

  apis: ['./docs/swagger/**/*.js']
});
