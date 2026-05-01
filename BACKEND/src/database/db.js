const Database = require('better-sqlite3');

const db = new Database('database.db');

// Criar tabela se não existir
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  email TEXT UNIQUE,
  senha TEXT,
  tipo TEXT, -- admin | mentor | aluno
  status TEXT
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS disciplinas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  codigo TEXT,
  cargaHoraria INTEGER
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS mentor_disciplinas (
  mentor_id INTEGER,
  disciplina_id INTEGER
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS aluno_disciplinas (
  aluno_id INTEGER,
  disciplina_id INTEGER
)
  `).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS mentorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER,
  mentor_id INTEGER,
  disciplina_id INTEGER,
  data TEXT,
  horario TEXT,
  status TEXT, -- pendente, confirmado, cancelado
  resumo TEXT,
  presenca BOOLEAN
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  remetente_id INTEGER,
  destinatario_id INTEGER,
  conteudo TEXT,
  data_envio TEXT
)
`).run();

module.exports = db;