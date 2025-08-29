import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name (ES6 equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadPaths = {
  resumes: path.join(__dirname, '../../uploads/resumes'),
  documents: path.join(__dirname, '../../uploads/documents'),
  profiles: path.join(__dirname, '../../uploads/profiles'),
  companies: path.join(__dirname, '../../uploads/companies'),
  certificates: path.join(__dirname, '../../uploads/certificates')
};

// Create directories if they don't exist
Object.values(uploadPaths).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadPaths.documents; // default
    
    // Determine upload path based on file type or route
    if (req.route.path.includes('resume') || file.fieldname === 'resume') {
      uploadPath = uploadPaths.resumes;
    } else if (req.route.path.includes('profile') || file.fieldname === 'profilePicture') {
      uploadPath = uploadPaths.profiles;
    } else if (req.route.path.includes('company') || file.fieldname === 'logo') {
      uploadPath = uploadPaths.companies;
    } else if (file.fieldname === 'certificate') {
      uploadPath = uploadPaths.certificates;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${file.fieldname}-${uniqueSuffix}-${sanitizedOriginalName}`;
    
    // Store filename in request for later use
    req.uploadedFilename = filename;
    
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = {
    resume: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    image: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]
  };

  let allowedTypes = allowedMimeTypes.document; // default

  // Determine allowed types based on field name or route
  if (file.fieldname === 'resume' || req.route.path.includes('resume')) {
    allowedTypes = allowedMimeTypes.resume;
  } else if (file.fieldname === 'profilePicture' || file.fieldname === 'logo') {
    allowedTypes = allowedMimeTypes.image;
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Maximum 5 files per request
  },
  fileFilter: fileFilter
});

// Middleware for single resume upload
export const uploadResume = upload.single('resume');

// Middleware for multiple document uploads
export const uploadDocuments = upload.array('documents', 5);

// Middleware for profile picture upload
export const uploadProfilePicture = upload.single('profilePicture');

// Middleware for company logo upload
export const uploadCompanyLogo = upload.single('logo');

// Middleware for certificate uploads
export const uploadCertificates = upload.array('certificates', 10);

// Middleware for mixed file uploads (resume + documents)
export const uploadMixed = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
  { name: 'certificates', maxCount: 10 }
]);

// File processing middleware
export const processUploadedFile = (req, res, next) => {
  if (req.file) {
    req.fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`
    };
  }
  
  if (req.files) {
    req.filesInfo = [];
    
    // Handle array of files
    if (Array.isArray(req.files)) {
      req.filesInfo = req.files.map(file => ({
        fieldname: file.fieldname,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
      }));
    } 
    // Handle object with field names as keys
    else {
      Object.keys(req.files).forEach(fieldname => {
        req.files[fieldname].forEach(file => {
          req.filesInfo.push({
            fieldname: file.fieldname,
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
          });
        });
      });
    }
  }
  
  next();
};

// Cleanup uploaded files on error
export const cleanupFiles = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      // Delete uploaded files if request failed
      const filesToDelete = [];
      
      if (req.file) {
        filesToDelete.push(req.file.path);
      }
      
      if (req.files) {
        if (Array.isArray(req.files)) {
          filesToDelete.push(...req.files.map(file => file.path));
        } else {
          Object.values(req.files).forEach(fileArray => {
            filesToDelete.push(...fileArray.map(file => file.path));
          });
        }
      }
      
      filesToDelete.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Cleaned up file: ${filePath}`);
        }
      });
    }
  });
  
  next();
};

// File validation middleware
export const validateFileSize = (maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);
    
    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} is too large. Maximum size allowed is ${maxSize / (1024 * 1024)}MB`
        });
      }
    }
    
    next();
  };
};

// Extract text from PDF/DOC files (placeholder for future implementation)
export const extractTextFromFile = async (req, res, next) => {
  // This would use libraries like pdf-parse or mammoth for text extraction
  // For now, we'll skip this and assume text is provided separately
  next();
};

// Error handling for multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error'
        });
    }
  }
  
  next(error);
};

export { uploadPaths };
