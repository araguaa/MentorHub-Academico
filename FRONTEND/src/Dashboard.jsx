import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export function Dashboard() {
  const [perfil, setPerfil] = useState('publico');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [erroApi, setErroApi] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  
  // Controle de Abas dentro do Painel Admin
  const [abaAtiva, setAbaAtiva] = useState('geral'); // geral | alunos | mentores | disciplinas
  const [exibirModalCadastro, setExibirModalCadastro] = useState(false);
  
  // Estados para armazenar dados vindos do SQLite
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [listaDisciplinas, setListaDisciplinas] = useState([]);

  // Formulários
  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: errorsLogin } } = useForm();
  const { register: registerUser, handleSubmit: handleSubmitUser, reset: resetUserForm, formState: { errors: errorsUser } } = useForm();
  const { register: registerDisc, handleSubmit: handleSubmitDisc, reset: resetDiscForm, formState: { errors: errorsDisc } } = useForm();

  // Buscar usuários e disciplinas do banco de dados
  const carregarDadosBanco = async () => {
    try {
      const resUsuarios = await axios.get('http://localhost:3000/users');
      setListaUsuarios(resUsuarios.data);
      
      // Quando criarmos a rota de disciplinas buscamos aqui, por enquanto iniciamos vazio
      setListaDisciplinas([]);
    } catch (err) {
      console.error("Erro ao carregar dados do SQLite", err);
    }
  };

  // Carrega os dados assim que o Admin logar ou mudar de aba
  useEffect(() => {
    if (perfil === 'admin') {
      carregarDadosBanco();
    }
  }, [perfil, abaAtiva]);

  const handleLoginReal = async (dados) => {
    setErroApi('');
    try {
      const resposta = await axios.post('http://localhost:3000/auth/login', {
        email: dados.email,
        senha: dados.senha
      });
      const { user, token } = resposta.data;
      localStorage.setItem('@MentorHub:token', token);
      setUsuarioLogado(user);
      setPerfil(user.tipo);
    } catch (err) {
      setErroApi(err.response?.data?.error || 'Falha na comunicação.');
    }
  };

  const handleCadastroUsuario = async (dados) => {
    setErroApi('');
    setMensagemSucesso('');
    try {
      await axios.post('http://localhost:3000/auth/register', {
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        tipo: dados.tipo
      });
      setMensagemSucesso(`Usuário cadastrado com sucesso!`);
      resetUserForm();
      setExibirModalCadastro(false);
      carregarDadosBanco(); // Atualiza a tabela na hora
    } catch (err) {
      setErroApi(err.response?.data?.error || 'Erro ao salvar no banco.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@MentorHub:token');
    setUsuarioLogado(null);
    setPerfil('publico');
  };

  // Filtros de usuários por tipo
  const alunosCadastrados = listaUsuarios.filter(u => u.tipo === 'aluno' || u.tipoUsuario === 'Aluno');
  const mentoresCadastrados = listaUsuarios.filter(u => u.tipo === 'mentor' || u.tipoUsuario === 'Mentor');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', margin: 0 }}>
      
      {/* 1. SIDEBAR AZUL PREMIUM */}
      <aside style={{ width: '260px', backgroundColor: '#0d233a', color: 'white', display: 'flex', flexDirection: 'column', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <span style={{ fontSize: '28px' }}>🛡️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px' }}>MentorHub</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Painel de Controle</span>
          </div>
        </div>

        {/* Links de navegação baseados no perfil logado */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          {perfil === 'admin' ? (
            <>
              <button onClick={() => setAbaAtiva('geral')} style={{ background: abaAtiva === 'geral' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>📊 Visão Geral</button>
              <button onClick={() => setAbaAtiva('alunos')} style={{ background: abaAtiva === 'alunos' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>👨‍🎓 Gestão de Alunos</button>
              <button onClick={() => setAbaAtiva('mentores')} style={{ background: abaAtiva === 'mentores' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>👨‍🏫 Gestão de Mentores</button>
              <button onClick={() => setAbaAtiva('disciplinas')} style={{ background: abaAtiva === 'disciplinas' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>📚 Disciplinas</button>
            </>
          ) : (
            <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', fontSize: '14px' }}>🏠 Início</button>
          )}
        </nav>

        {perfil !== 'publico' && (
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>👤 {usuarioLogado?.nome}</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Acesso: {perfil.toUpperCase()}</span>
            <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', marginTop: '10px' }}>Sair da Conta</button>
          </div>
        )}
      </aside>

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL */}
      <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* --- TELA DE LOGIN PÚBLICA --- */}
        {perfil === 'publico' && (
          <div style={{ maxWidth: '450px', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', margin: '100px auto' }}>
            <h3 style={{ marginTop: 0, color: '#0d233a', marginBottom: '8px', textAlign: 'center', fontSize: '24px' }}>MentorHub Acadêmico</h3>
            <p style={{ color: '#64748b', textAlign: 'center', fontSize: '14px', marginBottom: '30px' }}>Insira suas credenciais institucionais</p>
            
            {erroApi && <div style={{ backgroundColor: '#ffeeec', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>⚠️ {erroApi}</div>}

            <form onSubmit={handleSubmitLogin(handleLoginReal)}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>E-mail:</label>
                <input type="email" {...registerLogin("email", { required: "O e-mail é obrigatório" })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="seu.nome@instituicao.edu" />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Senha:</label>
                <input type="password" {...registerLogin("senha", { required: "A senha é obrigatória" })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="••••••••" />
              </div>

              <button type="submit" style={{ width: '100%', backgroundColor: '#0d233a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Entrar no Sistema</button>
            </form>
          </div>
        )}

        {/* --- CONTEÚDO EXCLUSIVO DO ADMINISTRADOR --- */}
        {perfil === 'admin' && (
          <div>
            {/* Mensagens de feedback de ações */}
            {mensagemSucesso && <div style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '14px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #a7f3d0', fontWeight: '500' }}>✅ {mensagemSucesso}</div>}

            {/* ABA 1: VISÃO GERAL (CARD CARDS COM ESTATÍSTICAS MACRO - RF18) */}
            {abaAtiva === 'geral' && (
              <div>
                <h2 style={{ color: '#0d233a', marginBottom: '4px' }}>Visão Geral do Sistema</h2>
                <p style={{ color: '#64748b', marginTop: 0, marginBottom: '30px' }}>Estatísticas em tempo real puxadas do SQLite.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '32px' }}>👨‍🎓</span>
                    <h4 style={{ margin: '12px 0 4px 0', color: '#64748b' }}>Total de Alunos</h4>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0d233a' }}>{alunosCadastrados.length}</p>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '32px' }}>👨‍🏫</span>
                    <h4 style={{ margin: '12px 0 4px 0', color: '#64748b' }}>Mentores Ativos</h4>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0d233a' }}>{mentoresCadastrados.length}</p>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '32px' }}>📚</span>
                    <h4 style={{ margin: '12px 0 4px 0', color: '#64748b' }}>Disciplinas Mapeadas</h4>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0d233a' }}>{listaDisciplinas.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: LISTAGEM DE ALUNOS COM LAYOUT CLEAN */}
            {abaAtiva === 'alunos' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ color: '#0d233a', margin: 0 }}>Gestão de Alunos</h2>
                    <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Alunos com direito a solicitar mentorias na plataforma.</p>
                  </div>
                  <button onClick={() => setExibirModalCadastro(true)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>+ Cadastrar Aluno</button>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '16px', color: '#475569' }}>Nome</th>
                        <th style={{ padding: '16px', color: '#475569' }}>E-mail Institucional</th>
                        <th style={{ padding: '16px', color: '#475569' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alunosCadastrados.map(aluno => (
                        <tr key={aluno.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px', fontWeight: '500', color: '#0d233a' }}>{aluno.nome || aluno.name}</td>
                          <td style={{ padding: '16px', color: '#475569' }}>{aluno.email}</td>
                          <td style={{ padding: '16px' }}><span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Ativo</span></td>
                        </tr>
                      ))}
                      {alunosCadastrados.length === 0 && (
                        <tr><td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Nenhum aluno cadastrado no banco de dados ainda.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ABA 3: LISTAGEM DE MENTORES */}
            {abaAtiva === 'mentores' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ color: '#0d233a', margin: 0 }}>Gestão de Mentores</h2>
                    <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Especialistas vinculados para atendimento acadêmico.</p>
                  </div>
                  <button onClick={() => setExibirModalCadastro(true)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>+ Cadastrar Mentor</button>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '16px', color: '#475569' }}>Nome</th>
                        <th style={{ padding: '16px', color: '#475569' }}>E-mail Institucional</th>
                        <th style={{ padding: '16px', color: '#475569' }}>Perfil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mentoresCadastrados.map(mentor => (
                        <tr key={mentor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px', fontWeight: '500', color: '#0d233a' }}>{mentor.nome}</td>
                          <td style={{ padding: '16px', color: '#475569' }}>{mentor.email}</td>
                          <td style={{ padding: '16px' }}><span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>MENTOR</span></td>
                        </tr>
                      ))}
                      {mentoresCadastrados.length === 0 && (
                        <tr><td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Nenhum mentor cadastrado no banco de dados ainda.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ABA 4: GESTÃO DE DISCIPLINAS */}
            {abaAtiva === 'disciplinas' && (
              <div>
                <h2 style={{ color: '#0d233a', marginBottom: '24px' }}>Gestão de Disciplinas (RF05)</h2>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '500px' }}>
                  <h4 style={{ margin: '0 0 15px 0' }}>Cadastrar Nova Disciplina</h4>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>As disciplinas permitem organizar as futuras mentorias.</p>
                  <button style={{ backgroundColor: '#0d233a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>Configurar Grade Curricular</button>
                </div>
              </div>
            )}

            {/* MODAL SUSPENSO MODERNO PARA CADASTRO (EVITA POLUIR A TELA) */}
            {exibirModalCadastro && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#0d233a' }}>Novo Registro</h3>
                    <button onClick={() => setExibirModalCadastro(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                  </div>

                  <form onSubmit={handleSubmitUser(handleCadastroUsuario)}>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Nome:</label>
                      <input type="text" {...registerUser("nome", { required: true })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="Nome Completo" />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>E-mail:</label>
                      <input type="email" {...registerUser("email", { required: true })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="exemplo@instituicao.edu" />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Senha:</label>
                      <input type="password" {...registerUser("senha", { required: true })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="••••••••" />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Perfil:</label>
                      <select {...registerUser("tipo", { required: true })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                        <option value="aluno">Aluno</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Salvar no SQLite</button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* --- OUTROS STUBS --- */}
        {perfil === 'aluno' && (<div><h2>Painel do Aluno</h2><p>Área sob demanda.</p></div>)}
        {perfil === 'mentor' && (<div><h2>Painel do Mentor</h2><p>Área sob demanda.</p></div>)}

      </main>
    </div>
  );
}