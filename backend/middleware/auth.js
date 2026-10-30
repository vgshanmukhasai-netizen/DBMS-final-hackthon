const jwt = require('jsonwebtoken');
const { User, Student, Teacher } = require('../models');

/**
 * Middleware to verify JWT token and attach user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing.',
      });
    }

    const secret = process.env.JWT_SECRET || 'university_event_management_secret_key_2024';
    const decoded = jwt.verify(token, secret);

    // Fetch user from DB with associated profile
    const user = await User.findByPk(decoded.id, {
      include: [
        { model: Student, as: 'studentProfile' },
        { model: Teacher, as: 'teacherProfile' },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User no longer exists.',
      });
    }

    // Attach user to req
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
  }
};

/**
 * Middleware to restrict access based on roles
 * @param  {...string} roles Allowed roles ('admin', 'teacher', 'student')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles: ${roles.join(', ')}.`,
      });
    }

    // If teacher, check if approved by admin
    if (req.user.role === 'teacher' && !req.user.is_approved) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Your faculty account is pending approval by the administrator.',
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
