import express from 'express';
import {
  registerStudent,
  loginStudent,
  getProfile,
  updateProfile,
  uploadResume,
  analyzeResume,
  getResumeAnalysis,
  improveResume,
  getAllResumes,
  deleteResume,
  uploadDocuments,
  getDocuments,
  deleteDocument,
  verifyDocument,
  getPlacementDrives,
  applyToDrive,
  getApplications,
  getApplicationDetails,
  withdrawApplication,
  getOffers,
  respondToOffer,
  getOfferDetails,
  requestProfileVerification,
  updatePassword,
  getStats,
  exportProfile
} from '../controllers/studentController.js';

import {
  protect,
  studentOnly,
  requireVerification,
  requireCompleteProfile
} from '../middlewares/auth.js';

import {
  uploadResume as uploadResumeMiddleware,
  uploadDocuments as uploadDocumentsMiddleware,
  uploadProfilePicture,
  processUploadedFile,
  cleanupFiles,
  handleMulterError
} from '../middlewares/upload.js';

const router = express.Router();

// Public routes
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// Protected routes (require authentication)
router.use(protect);
router.use(studentOnly);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.get('/stats', getStats);
router.get('/export', exportProfile);

// Profile picture upload
router.post('/profile/picture', 
  uploadProfilePicture, 
  processUploadedFile, 
  cleanupFiles, 
  handleMulterError, 
  updateProfile
);

// Resume management routes
router.get('/resumes', getAllResumes);
router.post('/resume/upload', 
  uploadResumeMiddleware, 
  processUploadedFile, 
  cleanupFiles, 
  handleMulterError, 
  uploadResume
);
router.post('/resume/analyze', analyzeResume);
router.get('/resume/analysis/:resumeId', getResumeAnalysis);
router.post('/resume/improve', improveResume);
router.delete('/resume/:resumeId', deleteResume);

// Document management routes
router.get('/documents', getDocuments);
router.post('/documents/upload', 
  uploadDocumentsMiddleware, 
  processUploadedFile, 
  cleanupFiles, 
  handleMulterError, 
  uploadDocuments
);
router.delete('/documents/:documentId', deleteDocument);
router.post('/documents/:documentId/verify', verifyDocument);

// Placement drives routes
router.get('/drives', getPlacementDrives);
router.post('/drives/:driveId/apply', 
  requireVerification, 
  requireCompleteProfile, 
  applyToDrive
);

// Applications routes
router.get('/applications', getApplications);
router.get('/applications/:applicationId', getApplicationDetails);
router.put('/applications/:applicationId/withdraw', withdrawApplication);

// Offers routes
router.get('/offers', getOffers);
router.get('/offers/:offerId', getOfferDetails);
router.put('/offers/:offerId/respond', respondToOffer);

// Verification routes
router.post('/verify/request', requestProfileVerification);

export default router;
