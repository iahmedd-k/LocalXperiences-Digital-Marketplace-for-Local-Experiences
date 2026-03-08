const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: 'Not Found' });
};

const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error:', err);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
