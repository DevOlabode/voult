require('dotenv').config();

['ENDUSER_JWT_SECRET', 'BASE_URL'].forEach((key) => {
  if (!process.env[key] || !String(process.env[key]).trim()) {
    throw new Error(`${key} is missing or empty. Set it in .env with no spaces around = (e.g. BASE_URL=https://www.voult.dev).`);
  }
});


const express = require('express');
const app = express();

app.set('trust-proxy', 1);

const ejsMate = require('ejs-mate');
const path = require('path');

const session = require('express-session');
const flash = require('connect-flash');

const passport = require('../config/passport');

const sessionConfig = require('../config/session');

const methodOverride = require('method-override');

// const cors  = require('cors');
// const corsOptions = require('../middleware/corsOptions');
// app.use(cors(corsOptions));

const cors = require('cors');

app.use(cors({
  origin: [
    'https://www.voult.dev',
    'https://voult.onrender.com/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'x-client-secret',
    'X-Client-Id'
  ]
}));

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerSpec = YAML.load('./docs/openapi.yaml');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'voult.dev API Docs',
  customCss: `
    .swagger-ui .topbar {
      background-color: #0f172a;
    }
  `,
}));

const ExpressError = require('../utils/ExpressError');

const routes = require('../routes/index');

require('../config/database')();
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, '../public')));

app.use(methodOverride('_method'));

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.currentUser = req.user;
    next();
  });

app.use(express.json());
app.use(express.urlencoded({ 
  extended: true,
  limit : '10kb'
}));

const {requestLogger} = require('../middleware/requestLogger');
app.use(requestLogger)

app.use(routes); 

// Error Handler.  
const { sendError } = require('../utils/apiError');

app.use('/api', (err, req, res, next) => {
  console.error('API ERROR:', err);
  return sendError(res, err);
});

app.use((req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;

  // API error handler
  if (req.originalUrl.startsWith('/api')) {
    return res.status(status).json({
      error: err.message || 'Something went wrong'
    });
  }

  // Web error handler
  if (status === 404) {
    return res.status(404).render('error/404', {title : 'Page Not Found'});
  }

  console.error(err);
  res.status(status).render('error/500', {title : 'Internal Server Error'});
});
  

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`App is listening on PORT ${PORT}`)
});