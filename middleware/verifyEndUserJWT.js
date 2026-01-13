// const jwt = require('jsonwebtoken');
// const EndUser = require('../models/EndUser');
// const App = require('../models/App');

// const JWT_SECRET = process.env.ENDUSER_JWT_SECRET;

// module.exports.verifyEndUserJWT = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     // 1. Check header exists
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({
//         error: 'Missing or invalid Authorization header'
//       });
//     }

//     // 2. Extract token
//     const token = authHeader.split(' ')[1];

//     // 3. Verify token
//     const payload = jwt.verify(token, JWT_SECRET);

//     // 4. Fetch app (scope enforcement)
//     const app = await App.findById(payload.app);

//     if (!app || !app.isActive) {
//       return res.status(401).json({
//         error: 'Invalid or inactive app'
//       });
//     }

//     // 5. Fetch end user
//     const endUser = await EndUser.findById(payload.sub);

//     if (!endUser) {
//       return res.status(401).json({
//         error: 'User not found'
//       });
//     }

//     // 6. Attach to request
//     req.endUser = endUser;
//     req.app = app;

//     next();
//   } catch (err) {
//     return res.status(401).json({
//       error: 'Invalid or expired token'
//     });
//   }
// };

const jwt = require('jsonwebtoken');
const EndUser = require('../models/EndUser');
const App = require('../models/App');

const JWT_SECRET = process.env.ENDUSER_JWT_SECRET;

module.exports.verifyEndUserJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('AUTH HEADER:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Bad auth header' });
    }

    const token = authHeader.split(' ')[1];
    console.log('TOKEN:', token);

    const payload = jwt.verify(token, JWT_SECRET);
    console.log('PAYLOAD:', payload);

    const app = await App.findById(payload.app);
    console.log('APP:', app?._id);

    const endUser = await EndUser.findById(payload.sub);
    console.log('USER:', endUser?._id);

    req.endUser = endUser;
    req.app = app;

    next();
  } catch (err) {
    console.error('JWT ERROR:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
