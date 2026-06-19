const db = require('../database/db');

// --- OPERAÇÕES DO ADMIN ---

// Atribuir aluno a mentor e disciplina
exports.criarVinculo = (req, res) => {
  const { aluno_id, mentor_id, disciplina_id } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO vinculos (aluno_id, mentor_id, disciplina_id) VALUES (?, ?, ?)');
    const result = stmt.run(aluno_id, mentor_id, disciplina_id);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Vínculo acadêmico criado!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar todos os vínculos com nomes populados (Relatório Geral)
exports.listarVinculos = (req, res) => {
  try {
    const query = `
      SELECT v.id, 
             a.nome as aluno_nome, a.email as aluno_email,
             m.nome as mentor_nome, m.email as mentor_email,
             d.nome as disciplina_nome, d.codigo as disciplina_codigo
      FROM vinculos v
      JOIN users a ON v.aluno_id = a.id
      JOIN users m ON v.mentor_id = m.id
      JOIN disciplinas d ON v.disciplina_id = d.id
    `;
    const relatorio = db.prepare(query).all();
    res.json(relatorio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- OPERAÇÕES DO MENTOR ---

// Criar e Agendar Monitoria
exports.agendarMonitoria = (req, res) => {
  const { vinculo_id, data, descricao } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO monitorias (vinculo_id, data, descricao) VALUES (?, ?, ?)');
    const result = stmt.run(vinculo_id, data, descricao);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Monitoria agendada com sucesso!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar monitorias de um mentor específico
exports.listarMonitoriasPorMentor = (req, res) => {
  const { mentorId } = req.params;
  try {
    const query = `
      SELECT m.*, a.nome as aluno_nome, d.nome as disciplina_nome
      FROM monitorias m
      JOIN vinculos v ON m.vinculo_id = v.id
      JOIN users a ON v.aluno_id = a.id
      JOIN disciplinas d ON v.disciplina_id = d.id
      WHERE v.mentor_id = ?
    `;
    // CORRIGIDO: Agora passa o mentorId para o SQLite preencher o "?"
    const monitorias = db.prepare(query).all(mentorId); 
    res.json(monitorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lançar Notas e Alterar Destaque de Aluno
exports.salvarDesempenho = (req, res) => {
  const { aluno_id, disciplina_id, nota_inicial, nota_intermediaria, nota_final, destaque } = req.body;
  try {
    // Verifica se já existe registro de desempenho para o par aluno-disciplina
    const existente = db.prepare('SELECT id FROM desempenho WHERE aluno_id = ? AND disciplina_id = ?').get(aluno_id, disciplina_id);
    
    if (existente) {
      const stmt = db.prepare(`
        UPDATE desempenho 
        SET nota_inicial = ?, nota_intermediaria = ?, nota_final = ?, destaque = ?
        WHERE id = ?
      `);
      stmt.run(nota_inicial, nota_intermediaria, nota_final, destaque, existente.id);
    } else {
      const stmt = db.prepare(`
        INSERT INTO desempenho (aluno_id, disciplina_id, nota_inicial, nota_intermediaria, nota_final, destaque)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(aluno_id, disciplina_id, nota_inicial, nota_intermediaria, nota_final, destaque);
    }
    res.json({ message: 'Dados de desempenho e destaque salvos!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Buscar a lista de desempenho (Gráficos)
exports.listarDesempenhoCompleto = (req, res) => {
  try {
    const query = `
      SELECT d.*, a.nome as aluno_nome, disp.nome as disciplina_nome
      FROM desempenho d
      JOIN users a ON d.aluno_id = a.id
      JOIN disciplinas disp ON d.disciplina_id = disp.id
    `;
    const dados = db.prepare(query).all();
    res.json(dados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};