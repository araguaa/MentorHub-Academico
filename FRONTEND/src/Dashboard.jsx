import { useState } from 'react';
import { useForm } from 'react-hook-form';

export function Dashboard() {
  // Estado para controlar qual perfil simular (público/login, aluno, mentor, admin)
  const [perfil, setPerfil] = useState('publico');
  const { register, handleSubmit } = useForm();

  const handleLoginSimulado = (dados) => {
    alert(`Autenticando: ${dados.email}`);
    setPerfil('aluno'); // Inicializa como aluno ao logar
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', margin: 0 }}>
      
      {/* 1. BARRA LATERAL (SIDEBAR) - Baseada fielmente na imagem */}
      <aside style={{ width: '260px', backgroundColor: '#0d233a', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>MentorHub</h2>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Acadêmico</span>
          </div>
        </div>

        {/* Links de Navegação da Sidebar */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
          <button onClick={() => setPerfil('publico')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', width: '100%', fontSize: '15px' }}>🏠 Início</button>
          <button style={{ background: 'none', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>📚 Disciplinas</button>
          <button style={{ background: 'none', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>📅 Agendamentos</button>
          <button style={{ background: 'none', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>📊 Relatórios</button>
          <button style={{ background: 'none', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>✉️ Mensagens</button>
        </nav>

        {/* Rodapé da Sidebar com info do Usuário */}
        {perfil !== 'publico' && (
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px' }}>👤 Perfil: <strong>{perfil.toUpperCase()}</strong></span>
            <button onClick={() => setPerfil('publico')} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Sair</button>
          </div>
        )}
      </aside>

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL (DIREITA) */}
      <main style={{ flexGrow: 1, padding: '40px' }}>
        
        {/* --- CASO 1: VISÃO PÚBLICA (TELA HERO + LOGIN) --- */}
        {perfil === 'publico' && (
          <div>
            {/* Banner Principal de Boas-vindas (Conforme a imagem) */}
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ maxWidth: '60%' }}>
                <span style={{ color: '#0d233a', fontWeight: 'bold', fontSize: '18px' }}>Bem-vindo!</span>
                <h1 style={{ color: '#0d233a', fontSize: '28px', marginTop: '10px', marginBottom: '15px', lineHeight: '1.3' }}>
                  CONECTANDO ALUNOS E MENTORES PARA SUPERAR DESAFIOS ACADÊMICOS.
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>ORGANIZAÇÃO, AGENDAMENTO E CONTROLE DE MENTORIAS ACADÊMICAS.</p>
              </div>
              {/* Simulador de Calendário Estático igual ao da imagem */}
              <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', fontSize: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                <strong>Eventos 2026</strong>
                <div style={{ marginTop: '5px', color: '#64748b' }}>Junho 📅</div>
              </div>
            </div>

            {/* Seção Inferior: Form de Acesso + Seletor de Perfis para Teste */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, color: '#0d233a', marginBottom: '20px' }}>Formulário de Acesso</h3>
                <form onSubmit={handleSubmit(handleLoginSimulado)}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>E-mail Institucional:</label>
                    <input type="email" {...register("email", { required: true })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="seu.nome@instituicao.edu" />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Senha:</label>
                    <input type="password" {...register("senha", { required: true })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="••••••••" />
                  </div>
                  <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Entrar no Painel</button>
                </form>
              </div>

              {/* Caixa para simular perfis e ver o comportamento dinâmico */}
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                <h4 style={{ margin: '0 0 10px 0', textAlign: 'center', color: '#64748b' }}>Simular Telas (Passo a Passo)</h4>
                <button onClick={() => setPerfil('aluno')} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Visualizar como ALUNO</button>
                <button onClick={() => setPerfil('mentor')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Visualizar como MENTOR</button>
                <button onClick={() => setPerfil('admin')} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Visualizar como ADMIN</button>
              </div>
            </div>
          </div>
        )}

        {/* --- CASO 2: PAINEL DO ALUNO --- */}
        {perfil === 'aluno' && (
          <div>
            <h2 style={{ color: '#0d233a', marginBottom: '20px' }}>Painel do Aluno</h2>
            <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              <strong>Próxima Mentoria:</strong> Amanhã às 14h — Cálculo I com Mentor Luis.
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
              <h3>Minhas Disciplinas</h3>
              <p>Solicite atendimentos rápidos aqui.</p>
            </div>
          </div>
        )}

        {/* --- CASO 3: PAINEL DO MENTOR --- */}
        {perfil === 'mentor' && (
          <div>
            <h2 style={{ color: '#0d233a', marginBottom: '20px' }}>Painel do Mentor</h2>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
              <h3>Solicitações de Alunos</h3>
              <p>Gerencie seus horários e confirmações de presença.</p>
            </div>
          </div>
        )}

        {/* --- CASO 4: PAINEL DO ADMINISTRADOR --- */}
        {perfil === 'admin' && (
          <div>
            <h2 style={{ color: '#0d233a', marginBottom: '20px' }}>Painel do Administrador</h2>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
              <h3>Estatísticas Gerais</h3>
              <p>Controle de usuários, vinculação de disciplinas e relatórios macro.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}