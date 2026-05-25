const login = (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (password === 'admin1234') {
      return res.status(200).json({
        success: true,
        token: 'mock-jwt-token-kru-kok-1234',
        user: {
          name: 'ครูพิชญานนท์ (ครูก๊อก)',
          role: 'administrator',
          school: 'โรงเรียนอนุบาลหนองหานวิทยายน'
        }
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
