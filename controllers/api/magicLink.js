/**
 * WHAT WORKS (Magic Link):
 * Generates a token and send it via email.
 * Validates that the token is valid and not expired.
 * 
 * TODO:
 * Find the user in the db. If user is not found return error.
 * Generate JWT tokens for authentication
 * Log the user into their app.
 */

const { magicLinkEmail } = require('../../services/magicLinkEmail');
const MagicLinkToken = require('../../models/MagicLinkToken');
const crypto = require('crypto');

module.exports.sendLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required'
      });
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    
    // Set token expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Create and save the token record
    const tokenDoc = new MagicLinkToken({
      email: email.toLowerCase().trim(),
      tokenHash: MagicLinkToken.hashToken(rawToken),
      expiresAt
    });
    
    await tokenDoc.save();

    // Build the magic link URL
    const baseUrl = process.env.APP_URL || 'https://voult.dev';
    const magicLinkURL = `${baseUrl}/magic-link?token=${rawToken}`;

    // Send the email
    await magicLinkEmail(email, magicLinkURL);

    res.status(200).json({
      success: true,
      message: 'Magic link sent successfully. Please check your email'
    });

  } catch (err) {
    console.error('Magic link error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send magic link. Please try again later.'
    });
  }
};

module.exports.validateToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const tokenDoc = await MagicLinkToken.findAndValidateToken(token);

    if (!tokenDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Mark token as used
    await tokenDoc.markAsUsed();

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      email: tokenDoc.email
    });

  } catch (err) {
    console.error('Token validation error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to validate token'
    });
  }
};