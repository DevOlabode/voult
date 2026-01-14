const EndUser = require('../../models/endUser');

const {signEndUserToken} = require('../../utils/jwt');

module.exports.register = async(req, res)=>{
    const {email, password} = req.body;

    const app = req.appClient;

    if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
    };

    const existingUser = await EndUser.findOne({
        app : app._id,
        email
    });

    if(existingUser){
        return res.status(409).json({
            error : 'User with that email already exists'
        });
    }

    const user = new EndUser({
        app : app._id,
        email
    });

    await user.setPassword(password);
    await user.save();
  
    const token = signEndUserToken(user, app);
  
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const app = req.appClient;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }

  const user = await EndUser.findOne({
    app: app._id,
    email,
    deletedAt: null
  }).select('+passwordHash');

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }

  const isValid = await user.verifyPassword(password);

  if (!isValid) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signEndUserToken(user, app);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      email: user.email
    }
  });
};

module.exports.me = (req, res) => {
  res.json({
    id: req.endUser._id,
    email: req.endUser.email,
    app: req.app.name
  })
};

module.exports.logout = async (req, res) => {
  req.endUser.tokenVersion += 1;
  await req.endUser.save();

  res.json({
    message: 'Logged out successfully'
  });
};
