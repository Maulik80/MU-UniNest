import express from 'express';

const router = express.Router();

// Placeholder company routes
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Company routes - Coming soon'
  });
});

export default router;
