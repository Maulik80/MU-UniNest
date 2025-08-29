import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import University from '../models/University.js';

// Protect routes - general authentication
export const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token and add to request
      let user;
      
      switch (decoded.userType) {
        case 'student':
          user = await Student.findById(decoded.id).select('-password');
          break;
        case 'company':
          user = await Company.findById(decoded.id).select('-password');
          break;
        case 'university':
          user = await University.findById(decoded.id).select('-password');
          break;
        default:
          return res.status(401).json({
            success: false,
            message: 'Invalid user type'
          });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      req.user = user;
      req.userType = decoded.userType;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Authorize specific user types
export const authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.userType)) {
      return res.status(403).json({
        success: false,
        message: `User type '${req.userType}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Student only routes
export const studentOnly = (req, res, next) => {
  if (req.userType !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Students only.'
    });
  }
  next();
};

// Company only routes
export const companyOnly = (req, res, next) => {
  if (req.userType !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Companies only.'
    });
  }
  next();
};

// University only routes
export const universityOnly = (req, res, next) => {
  if (req.userType !== 'university') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Universities only.'
    });
  }
  next();
};

// Admin routes (university or specific admin roles)
export const adminOnly = (req, res, next) => {
  if (req.userType !== 'university' && req.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrators only.'
    });
  }
  next();
};

// Check if user owns the resource
export const checkResourceOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    // This will be implemented in specific route handlers
    // where we check if req.user._id matches the resource owner
    next();
  };
};

// Rate limiting for sensitive operations
export const sensitiveOperationLimit = (req, res, next) => {
  // Additional rate limiting for operations like password reset, profile updates
  // This can be customized based on user type and operation
  next();
};

// Verify email/phone for certain operations
export const requireVerification = (req, res, next) => {
  if (req.userType === 'student') {
    if (!req.user.emailVerified || !req.user.phoneVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email and phone verification required for this operation'
      });
    }
  }
  next();
};

// Check if profile is complete
export const requireCompleteProfile = (req, res, next) => {
  if (req.userType === 'student') {
    const student = req.user;
    const requiredFields = [
      'personalInfo.firstName',
      'personalInfo.lastName',
      'personalInfo.email',
      'personalInfo.phone',
      'academicInfo.university',
      'academicInfo.department',
      'academicInfo.course',
      'academicInfo.cgpa'
    ];

    const missingFields = [];
    requiredFields.forEach(field => {
      const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], student);
      if (!fieldValue) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Profile incomplete. Please complete your profile first.',
        missingFields
      });
    }
  }
  next();
};

// Generate JWT token
export const generateToken = (user, userType) => {
  return jwt.sign(
    { 
      id: user._id, 
      userType,
      email: user.email || user.personalInfo?.email 
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

// Send token response
export const sendTokenResponse = (user, statusCode, res, userType) => {
  // Create token
  const token = generateToken(user, userType);

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Remove password from response
  const userResponse = { ...user.toObject() };
  delete userResponse.password;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userResponse,
      userType
    });
};
