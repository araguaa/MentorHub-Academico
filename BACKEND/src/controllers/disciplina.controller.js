const db = require('../database/db');

exports.createDisciplina = (req, res) => {
  const { nome, codigo, cargaHoraria } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO disciplinas (nome, codigo, cargaHoraria) VALUES (?, ?, ?)');
    const result = stmt.run(nome, codigo, Number(cargaHoraria));
    res.status(201).json({ id: result.lastInsertRowid, nome, codigo, cargaHoraria });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getDisciplinas = (req, res) => {
  try {
    const disciplinas = db.prepare('SELECT * FROM disciplinas').all();
    res.json(disciplinas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDisciplina = (req, res) => {
  const { id } = req.params;
  const { nome, codigo, cargaHoraria } = req.body;
  try {
    const stmt = db.prepare('UPDATE disciplinas SET nome = ?, codigo = ?, cargaHoraria = ? WHERE id = ?');
    const info = stmt.run(nome, codigo, Number(cargaHoraria), id);
    if (info.changes === 0) return res.status(404).json({ error: 'Disciplina não encontrada.' });
    res.json({ message: 'Disciplina atualizada com sucesso!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteDisciplina = (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM disciplinas WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Disciplina não encontrada.' });
    res.json({ message: 'Disciplina removida com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};