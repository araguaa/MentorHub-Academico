const jwt = require('jsonwebtoken');

const SECRET = "segredo_super_forte";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    req.user = decoded; // { id, tipo }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};