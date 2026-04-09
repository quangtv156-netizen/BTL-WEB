const jwt = require('jsonwebtoken');

// Xac thuc JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ message: 'Khong co token, vui long dang nhap!' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token khong hop le hoac het han!' });
  }
};

// Chi giang vien hoac admin
const isInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor' && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Chi giang vien moi co quyen!' });
  next();
};

// Chi admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Chi admin moi co quyen!' });
  next();
};

// Chi hoc vien hoac admin
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student' && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Chi hoc vien moi co quyen!' });
  next();
};

module.exports = { verifyToken, isInstructor, isAdmin, isStudent };
