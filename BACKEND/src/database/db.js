const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../database.db'));

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo TEXT NOT NULL,
    status TEXT DEFAULT 'ativo' -- Adicionado para evitar quebras
  );

  CREATE TABLE IF NOT EXISTS disciplinas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo TEXT UNIQUE NOT NULL,
    cargaHoraria INTEGER NOT NULL
  );

  -- 🔌 NOVA: Atribuição de Aluno a Mentor e Disciplina
  CREATE TABLE IF NOT EXISTS vinculos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    mentor_id INTEGER NOT NULL,
    disciplina_id INTEGER NOT NULL,
    FOREIGN KEY(aluno_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(mentor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
  );

  -- 📅 NOVA: Agendamento e Registro de Monitorias
  CREATE TABLE IF NOT EXISTS monitorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vinculo_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    descricao TEXT,
    status TEXT DEFAULT 'Agendada',
    FOREIGN KEY(vinculo_id) REFERENCES vinculos(id) ON DELETE CASCADE
  );

  -- 📈 NOVA: Notas e Desempenho dos Alunos
  CREATE TABLE IF NOT EXISTS desempenho (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    disciplina_id INTEGER NOT NULL,
    nota_inicial REAL,
    nota_intermediaria REAL,
    nota_final REAL,
    destaque INTEGER DEFAULT 0, -- 0 = Normal, 1 = Aluno Destaque
    FOREIGN KEY(aluno_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
  );
`);

module.exports = db;