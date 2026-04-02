const successResponse = (res, statusCode = 200, message = '', data = null) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const errorResponse = (res, statusCode = 500, message = 'Server Error', errors = null) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

const paginatedResponse = (res, message = '', data = [], pagination = {}) => {
  return res.status(200).json({ success: true, message, data, pagination });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
