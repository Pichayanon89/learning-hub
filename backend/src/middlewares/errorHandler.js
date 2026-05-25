const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'System error'
  });
};

module.exports = {
  errorHandler
};
