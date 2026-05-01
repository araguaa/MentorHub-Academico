const db = require('../database/db');

// 📌 Aluno solicita mentoria
exports.solicitarMentoria = (req, res) => {
  const { aluno_id, mentor_id, disciplina_id, data, horario } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO mentorias 
      (aluno_id, mentor_id, disciplina_id, data, horario, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      aluno_id,
      mentor_id,
      disciplina_id,
      data,
      horario,
      'pendente'
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      status: 'pendente'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 📌 Mentor confirma
exports.confirmarMentoria = (req, res) => {
  const { id } = req.params;

  try {
    db.prepare(`
      UPDATE mentorias SET status = 'confirmado'
      WHERE id = ?
    `).run(id);

    res.json({ message: 'Mentoria confirmada' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 📌 Mentor recusa
exports.recusarMentoria = (req, res) => {
  const { id } = req.params;

  db.prepare(`
    UPDATE mentorias SET status = 'recusado'
    WHERE id = ?
  `).run(id);

  res.json({ message: 'Mentoria recusada' });
};

// 📌 Cancelar
exports.cancelarMentoria = (req, res) => {
  const { id } = req.params;

  db.prepare(`
    UPDATE mentorias SET status = 'cancelado'
    WHERE id = ?
  `).run(id);

  res.json({ message: 'Mentoria cancelada' });
};

// 📌 Registrar atendimento (resumo + presença)
exports.registrarAtendimento = (req, res) => {
  const { id } = req.params;
  const { resumo, presenca } = req.body;

  db.prepare(`
    UPDATE mentorias
    SET resumo = ?, presenca = ?, status = 'concluido'
    WHERE id = ?
  `).run(resumo, presenca ? 1 : 0, id);

  res.json({ message: 'Atendimento registrado' });
};

// 📌 Listar mentorias
exports.listarMentorias = (req, res) => {
  const mentorias = db.prepare(`
    SELECT * FROM mentorias
  `).all();

  res.json(mentorias);
};