const HttpError = require('../utils/httpError');

exports.notFound = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Maps Sequelize / app errors to clean HTTP responses
exports.errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }
  switch (err.name) {
    case 'SequelizeValidationError':
      return res.status(400).json({
        error: 'Validation failed',
        details: err.errors.map((e) => ({ field: e.path, message: e.message })),
      });
    case 'SequelizeUniqueConstraintError':
      return res.status(409).json({
        error: 'Unique constraint violated',
        details: err.errors.map((e) => ({ field: e.path, message: e.message })),
      });
    case 'SequelizeForeignKeyConstraintError':
      return res.status(409).json({ error: 'Foreign key constraint violated (related record missing or still in use)' });
    default:
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
  }
};
