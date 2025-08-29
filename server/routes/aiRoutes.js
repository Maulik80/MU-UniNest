import express from "express";
import {
  analyzeResumeJD,
  generateResumeImprovements,
  screenCandidate,
  generateStudentRecommendations,
  generateOfferEmail,
  generatePlacementInsights,
  extractResumeData,
  getAIUsageStats,
} from "../controllers/aiController.js";

import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// Resume analysis routes
router.post(
  "/resume/analyze",
  authorize("student", "university", "company"),
  analyzeResumeJD,
);
router.post(
  "/resume/improve",
  authorize("student", "university"),
  generateResumeImprovements,
);
router.post(
  "/resume/extract",
  authorize("student", "university"),
  extractResumeData,
);

// Candidate screening routes
router.post(
  "/candidate/screen",
  authorize("company", "university"),
  screenCandidate,
);
router.post(
  "/students/recommend",
  authorize("university", "company"),
  generateStudentRecommendations,
);

// Offer management routes
router.post(
  "/offer/email/generate",
  authorize("company", "university"),
  generateOfferEmail,
);

// Analytics and insights
router.post(
  "/insights/placement",
  authorize("university", "admin"),
  generatePlacementInsights,
);

// Usage statistics
router.get("/usage/stats", authorize("university", "admin"), getAIUsageStats);

export default router;
