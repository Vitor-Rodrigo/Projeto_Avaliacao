// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Produtos CRUD',
      version: '1.0.0',
      description: 'Documentação da API RESTful de Gerenciamento de Produtos.',
    },
    servers: [
      {
        url: 'http://localhost:3000', // URL base da sua API
        description: 'Servidor Local'
      },
    ],
  },
  // Aponta para o arquivo server.js, onde estão as anotações.
  apis: ['./server.js'], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
module.exports = swaggerSpec;