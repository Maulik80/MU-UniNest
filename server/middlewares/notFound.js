export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: {
      auth: "/api/v1/auth",
      students: "/api/v1/students",
      companies: "/api/v1/companies",
      universities: "/api/v1/universities",
      drives: "/api/v1/drives",
      applications: "/api/v1/applications",
      offers: "/api/v1/offers",
      admin: "/api/v1/admin",
      ai: "/api/v1/ai",
    },
  });
};
