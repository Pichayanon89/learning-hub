const { createAdminToken } = require('../utils/authToken');
const { isAdminPasswordConfigured, verifyAdminPassword } = require('../utils/adminPassword');

const adminUser = {
  name: 'ครูพิชญานนท์ (ครูก๊อก)',
  role: 'administrator',
  school: 'โรงเรียนอนุบาลหนองหานวิทยายน'
};

const login = (req, res, next) => {
  try {
    const { password } = req.body;

    res.setHeader('Cache-Control', 'no-store');

    if (!isAdminPasswordConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'ยังไม่ได้ตั้งค่ารหัสผ่านหลังบ้านบนเซิร์ฟเวอร์'
      });
    }

    if (verifyAdminPassword(password)) {
      const session = createAdminToken(adminUser);
      return res.status(200).json({
        success: true,
        token: session.token,
        expiresAt: session.expiresAt,
        user: adminUser
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'รหัสผ่านหลังบ้านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง!'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login
};
