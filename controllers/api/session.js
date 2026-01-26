const RefreshToken = require('../../models/refreshToken');
const {ApiError} = require('../../utils/apiError');

// =======================
// LIST SESSIONS
// =======================
module.exports.listSessions = async (req, res) => {
    if (!req.endUser) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
    };
  
    const sessions = await RefreshToken.find({
      endUser: req.endUser._id,
      app: req.endUser.app,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastUsedAt: -1 })
      .select('-tokenHash -replacedByTokenHash');
  
    res.status(200).json({
      sessions: sessions.map(s => ({
        id: s._id,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        lastUsedAt: s.lastUsedAt,
        expiresAt: s.expiresAt,
      })),
    });
  };


  module.exports.revokeSession = async (req, res) => {
    const { sessionId } = req.params;
  
    const session = await RefreshToken.findOne({
      _id: sessionId,
      endUser: req.endUser._id,
      app: req.appClient._id,
      revokedAt: null,
    });
  
    if (!session) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Session not found');
    }
  
    session.revokedAt = new Date();
    await session.save();
  
    res.status(200).json({
      message: 'Session revoked successfully',
    });
  };
  
  