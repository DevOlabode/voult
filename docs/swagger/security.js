module.exports = {
    ClientAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Bearer <CLIENT_SECRET>'
    },
    ClientId: {
      type: 'apiKey',
      in: 'header',
      name: 'X-Client-Id'
    },
    EndUserJWT: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  };