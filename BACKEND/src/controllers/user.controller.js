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
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
};