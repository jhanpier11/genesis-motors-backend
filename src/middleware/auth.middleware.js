const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'genesis_motors_secret_key');
    
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    if (!user.activo) {
      return res.status(401).json({ error: 'Usuario inactivo. Contacte al administrador.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Inicie sesión nuevamente.' });
    }
    res.status(500).json({ error: 'Error de autenticación.' });
  }
};

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción.',
        requiredRoles: roles,
        userRole: req.user.rol 
      });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };