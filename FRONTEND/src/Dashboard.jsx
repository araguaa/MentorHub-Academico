import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export function Dashboard() {
  const [perfil, setPerfil] = useState('publico');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [erroApi, setErroApi] = useState('');

  // Configuração do formulário com validação do React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Função assíncrona que realiza o POST real para o Backend
  const handleLoginReal = async (dados) => {
    setErroApi(''); // Limpa erros anteriores
    try {
      const resposta = await axios.post('http://localhost:3000/auth/login', {
        email: dados.email,
        senha: dados.senha
      });

      // Se deu certo, o backend retorna { token, user: { id, nome, tipo } }
      const { user, token } = resposta.data;
      
      // Salva o token para requisições futuras
      localStorage.setItem('@MentorHub:token', token);
      
      setUsuarioLogado(user);
      setPerfil(user.tipo); // Altera o painel dinamicamente para 'aluno', 'mentor' ou 'admin'
      alert(`Bem-vindo de volta, ${user.nome}!`);
    } catch (err) {
      // Tratamento de exceção descritivo (Exibe o erro retornado pelo servidor)
      if (err.response && err.response.data && err.response.data.error) {
        setErroApi(err.response.data.error);
      } else {
        setErroApi('Falha na comunicação com o servidor. Verifique se o backend está ligado.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@MentorHub:token');
    setUsuarioLogado(null);
    setPerfil('publico');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', margin: 0 }}>
      
      {/* 1. BARRA LATERAL (SIDEBAR) */}
      <aside style={{ width: '260px', backgroundColor: '#0d233a', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>MentorHub</h2>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Acadêmico</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
          <button style={{ background: perfil === 'publico' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', width: '100%', fontSize: '15px' }}>🏠 Início</button>
          <button style={{ background: 'none', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>📚 Disciplinas</button>
          <button style={{ background: 'none', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>📅 Agendamentos</button>
          <button style={{ background: 'none', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>📊 Relatórios</button>
          <button style={{ background: 'none', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>✉️ Mensagens</button>
        </nav>

        {perfil !== 'publico' && (
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '14px' }}>👤 <strong>{usuarioLogado?.nome}</strong></span>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Nível: {perfil.toUpperCase()}</span>
            <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Sair</button>
          </div>
        )}
      </aside>

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL */}
      <main style={{ flexGrow: 1, padding: '40px' }}>
        
        {/* --- CASO 1: VISÃO PÚBLICA (LOGIN) --- */}
        {perfil === 'publico' && (
          <div>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ maxWidth: '60%' }}>
                <span style={{ color: '#0d233a', fontWeight: 'bold', fontSize: '18px' }}>Bem-vindo!</span>
                <h1 style={{ color: '#0d233a', fontSize: '28px', marginTop: '10px', marginBottom: '15px', lineHeight: '1.3' }}>
                  CONECTANDO ALUNOS E MENTORES PARA SUPERAR DESAFIOS ACADÊMICOS.
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>ORGANIZAÇÃO, AGENDAMENTO E CONTROLE DE MENTORIAS ACADÊMICAS.</p>
              </div>
              <div style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', fontSize: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                <strong>Eventos 2026</strong>
                <div style={{ marginTop: '5px', color: '#64748b' }}>Junho 📅</div>
              </div>
            </div>

            <div style={{ maxWidth: '500px', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', margin: '0 auto' }}>
              <h3 style={{ marginTop: 0, color: '#0d233a', marginBottom: '20px', textAlign: 'center' }}>Acessar o MentorHub</h3>
              
              {/* Exibição descritiva de erros vindos do Servidor */}
              {erroApi && (
                <div style={{ backgroundColor: '#ffeeec', border: '1px solid #fecaca', color: '#ef4444', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
                  ⚠️ {erroApi}
                </div>
              )}

              <form onSubmit={handleSubmit(handleLoginReal)}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>E-mail Institucional:</label>
                  <input 
                    type="email" 
                    {...register("email", { required: "O e-mail é obrigatório" })} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                    placeholder="seu.nome@instituicao.edu" 
                  />
                  {errors.email && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.email.message}</span>}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Senha:</label>
                  <input 
                    type="password" 
                    {...register("senha", { required: "A senha é obrigatória" })} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                    placeholder="••••••••" 
                  />
                  {errors.senha && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.senha.message}</span>}
                </div>

                <button type="submit" style={{ width: '100%', backgroundColor: '#0d233a', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Entrar no Painel
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- CASO 2: PAINEL DO ALUNO --- */}
        {perfil === 'aluno' && (
          <div>
            <h2 style={{ color: '#0d233a', marginBottom: '20px' }}>Painel do Aluno</h2>
            <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              <strong>Status do Sistema:</strong> Conectado com sucesso ao SQLite via API!
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Minhas Disciplinas</h3>
              <p>Funcionalidade em desenvolvimento...</p>
            </div>
          </div>
        )}

        {/* --- CASO 3: PAINEL DO MENTOR --- */}
        {perfil === 'mentor' && (
          <div>
            <h2 style={{ color: '#0d233a', marginBottom: '20px' }}>Painel do Mentor</h2>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Solicitações de Alunos</h3>
              <p>Funcionalidade em desenvolvimento...</p>
            </div>
          </div>
        )}

        {/* --- CASO 4: PAINEL DO ADMINISTRADOR --- */}
        {perfil === 'admin' && (
          <div>
            <h2 style={{ color: '#0d233a', marginBottom: '20px' }}>Painel do Administrador</h2>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3>Estatísticas Gerais</h3>
              <p>Funcionalidade em desenvolvimento...</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}