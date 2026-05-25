const getUserById = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (id === 1) {
      return res.status(200).json({
        id: 1,
        name: 'user 01',
        email: 'user1@xx.com'
      });
    }

    if (id === 2) {
      return res.status(404).json({
        message: 'User id=2 not found in system'
      });
    }

    if (id === 3) {
      // Simulate system error by throwing an exception, which will be caught by error handler
      // or simply return 500
      return res.status(500).json({
        message: 'System error'
      });
    }

    // Default response if id is not 1, 2, or 3
    return res.status(404).json({
      message: `User id=${id} not found in system`
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserById
};
