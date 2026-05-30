const { verifyAdminToken } = require('../utils/authToken');

function requireAdminAuth(req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบหลังบ้านอีกครั้ง'
    });
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'เซสชันหมดอายุหรือไม่ถูกต้อง'
    });
  }

  req.admin = payload;
  next();
}

module.exports = {
  requireAdminAuth
};
