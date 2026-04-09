const express = require('express');
const cors = require('cors');
require('dotenv').config();

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LearnHub API',
      version: '1.0.0',
      description: 'API documentation cho he thong hoc truc tuyen LearnHub',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhap JWT token sau khi dang nhap. Vi du: eyJhbGci...'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'LearnHub API Docs',
  swaggerOptions: {
    persistAuthorization: true  // Giu token sau khi refresh trang
  }
}));

app.get('/', (req, res) => res.json({ message: 'LearnHub API dang chay!', docs: '/api-docs' }));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/courses',   require('./routes/courses'));
app.use('/api/lessons',   require('./routes/lessons'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/comments',  require('./routes/comments'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/enrolled',  require('./routes/enrolled'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/progress',  require('./routes/progress'));
app.use('/api/activity',  require('./routes/activity'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server dang chay tai http://localhost:' + PORT);
  console.log('Swagger UI: http://localhost:' + PORT + '/api-docs');
});