const db = require('./src/database/db');
const bcrypt = require('bcrypt');

async function criarUsuarioTeste() {
  try {
    const email = 'admentor@gmail.com';
    const senhaPura = '123';
    const nome = 'Administrador Mentor';
    const tipo = 'admin'; // tipo do usuário

    // Verifica se o usuário já existe para não duplicar
    const usuarioExistente = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    
    if (usuarioExistente) {
      console.log(`\n⚠️ O usuário ${email} já está cadastrado no banco de dados!`);
      return;
    }

    // Gera o hash seguro da senha "123"
    const hashSenha = await bcrypt.hash(senhaPura, 10);

    // Insere no banco SQLite
    const stmt = db.prepare(`
      INSERT INTO users (nome, email, senha, tipo, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(nome, email, hashSenha, tipo, 'ativo');

    console.log('\n✅ Usuário de testes criado com sucesso absoluto!');
    console.log(`📧 E-mail: ${email}`);
    console.log(`🔑 Senha: ${senhaPura}`);
    console.log(`👤 Perfil: ${tipo.toUpperCase()}\n`);

  } catch (error) {
    console.error('❌ Erro ao criar usuário de testes:', error.message);
  }
}

criarUsuarioTeste();