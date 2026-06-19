const db = require('../database/db');

exports.createUser = (req, res) => {
  const { name, email } = req.body;

  try {
    const stmt = db.prepare(
      'INSERT INTO users (name, email) VALUES (?, ?)'
    );

    const result = stmt.run(name, email);

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      email
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUsers = (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Atualizar Usuário (RF04)
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { nome, email, tipo } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE users SET nome = ?, email = ?, tipo = ? WHERE id = ?
    `);
    const info = stmt.run(nome, email, tipo, id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json({ message: 'Usuário atualizado com sucesso!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📌 Deletar Usuário (RF04)
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json({ message: 'Usuário removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};