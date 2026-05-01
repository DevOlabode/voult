/**
 * WHAT WORKS (Magic Link):
 * Generates a token and send it in a URL via email.
 * Validates that the token is valid and not expired.
 * 
 * TODO:
 * Find the user in the db. If user is not found return error.
 * Generate JWT tokens for authentication
 * Log the user into their app.
 */

const { magicLinkEmail } = require('../../services/magicLinkEmail');
const MagicLinkToken = require('../../models/MagicLinkToken');
const EndUser = require('../../models/endUser');
const App = require('../../models/app');
const { createTokens } = require('../../utils/createTokens');
const crypto = require('crypto');

/**
 * Send Magic Link
 * POST /api/send-magic-link
 * Body: { email: string, clientId: string, redirectUri: string }
 * 
 * The redirectUri is the developer's app URL where the user should be sent
 * after clicking the magic link. The developer's app will receive the token
 * and then call /api/validate-magic-link to get JWT tokens.
 */
module.exports.sendLink = async (req, res) => {
  try {
    const { email, clientId, redirectUri } = req.body;

    // Validate input
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required'
      });
    }

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID (appId) is required'
      });
    }

    if (!redirectUri) {
      return res.status(400).json({
        success: false,
        message: 'Redirect URI (developer app URL) is required'
      });
    }

    // Validate redirectUri format (must be a valid URL)
    try {
      new URL(redirectUri);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid redirect URI format. Must be a valid URL.'
      });
    }

    // Find the app
    const app = await App.findOne({ clientId });
    if (!app || !app.isActive) {
      return res.status(404).json({
        success: false,
        message: 'App not found or inactive'
      });
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    
    // Set token expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Create and save the token record
    const tokenDoc = new MagicLinkToken({
      email: email.toLowerCase().trim(),
      app: app._id,
      tokenHash: MagicLinkToken.hashToken(rawToken),
      expiresAt,
      redirectUri
    });
    
    await tokenDoc.save();

    // Build the magic link URL pointing to the developer's app
    // The token is passed as a query parameter to the developer's redirect URI
    const magicLinkURL = `${redirectUri}?token=${rawToken}`;

    // Send the email
    await magicLinkEmail(email, magicLinkURL);

    res.status(200).json({
      success: true,
      message: 'Magic link sent successfully. Please check your email.'
    });

  } catch (err) {
    console.error('Magic link error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send magic link. Please try again later.'
    });
  }
};

/**
 * Validate Magic Link Token and Authenticate User
 * POST /api/validate-magic-link
 * Body: { token: string }
 */
module.exports.validateToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Find and validate the token
    const tokenDoc = await MagicLinkToken.findAndValidateToken(token);

    if (!tokenDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Find or create the end user
    let user = await EndUser.findOne({ 
      email: tokenDoc.email, 
      app: tokenDoc.app 
    });

    if (!user) {
      // User doesn't exist - this is an error per requirements
      // Mark token as used to prevent reuse
      await tokenDoc.markAsUsed();
      
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please register first.'
      });
    }

    // Mark token as used
    await tokenDoc.markAsUsed();

    // Update user's last login and email verification
    user.lastLoginAt = new Date();
    user.isEmailVerified = true;
    await user.save();

    // Generate JWT tokens
    const { accessToken, refreshToken } = await createTokens({
      user,
      app: tokenDoc.app,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          isEmailVerified: user.isEmailVerified
        }
      }
    });

  } catch (err) {
    console.error('Token validation error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to validate token'
    });
  }
};