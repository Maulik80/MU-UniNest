import express from "express";

const router = express.Router();

// Placeholder auth routes
router.post("/login", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth routes - Coming soon",
  });
});

router.post("/register", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth routes - Coming soon",
  });
});

export default router;
