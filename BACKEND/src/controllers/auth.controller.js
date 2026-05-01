const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = "segredo_super_forte"; // depois coloque em .env

// 📌 Registro
exports.register = async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  try {
    const hash = await bcrypt.hash(senha, 10);

    const stmt = db.prepare(`
      INSERT INTO users (nome, email, senha, tipo, status)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(nome, email, hash, tipo, 'ativo');

    res.status(201).json({
      id: result.lastInsertRowid,
      email,
      tipo
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 📌 Login
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).get(email);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: user.id, tipo: user.tipo },
      SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        tipo: user.tipo
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};