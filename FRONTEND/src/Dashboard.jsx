import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export function Dashboard() {
  const [perfil, setPerfil] = useState('publico');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [erroApi, setErroApi] = useState('');
  
  // Estados para Mensagens Informativas Reativas
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mostrarMensagem, setMostrarMensagem] = useState(false);
  
  // Controle de Navegação das Abas do Ecossistema
  const [abaAtiva, setAbaAtiva] = useState('geral');
  const [exibirModalCadastro, setExibirModalCadastro] = useState(false);
  const [exibirModalDisciplina, setExibirModalDisciplina] = useState(false);
  const [exibirModalVinculo, setExibirModalVinculo] = useState(false);
  const [exibirModalMonitoria, setExibirModalMonitoria] = useState(false);
  const [exibirModalNotas, setExibirModalNotas] = useState(false);
  
  const [itemEmEdicao, setItemEmEdicao] = useState(null);
  const [alunoSelecionadoParaNotas, setAlunoSelecionadoParaNotas] = useState(null);
  const [alunoSelecionadoParaMonitoria, setAlunoSelecionadoParaMonitoria] = useState(null);

  // Estados dos dados acadêmicos sincronizados com o Banco de Dados
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [listaDisciplinas, setListaDisciplinas] = useState([]);
  const [listaVinculos, setListaVinculos] = useState([]);
  const [listaMonitorias, setListaMonitorias] = useState([]);
  const [listaDesempenho, setListaDesempenho] = useState([]);

  // Inicialização do React Hook Form para captura limpa de payloads
  const { register: registerLogin, handleSubmit: handleSubmitLogin } = useForm();
  const { register: registerUser, handleSubmit: handleSubmitUser, reset: resetUserForm, setValue: setValueUser } = useForm();
  const { register: registerDisc, handleSubmit: handleSubmitDisc, reset: resetDiscForm, setValue: setValueDisc } = useForm();
  const { register: registerVinculo, handleSubmit: handleSubmitVinculo, reset: resetVinculoForm } = useForm();
  const { register: registerMonit, handleSubmit: handleSubmitMonit, reset: resetMonitForm } = useForm();
  const { register: registerNotas, handleSubmit: handleSubmitNotas, reset: resetNotasForm } = useForm();

  // Limpeza de erros ao alternar abas de gerenciamento
  useEffect(() => {
    setMostrarMensagem(false);
    setTimeout(() => setMensagemSucesso(''), 300);
    setErroApi('');
    setItemEmEdicao(null);
  }, [abaAtiva]);

  const dispararMensagemSucesso = (texto) => {
    setMensagemSucesso(texto);
    setMostrarMensagem(true);
    setTimeout(() => setMostrarMensagem(false), 4000);
    setTimeout(() => setMensagemSucesso(''), 4300);
  };

// 🔄 SINCRONIZAÇÃO ADAPTATIVA COM O BACKEND
  const carregarDadosDoBanco = async () => {
    try {
      // Tenta rotas no plural e no singular para garantir compatibilidade com seu backend
      const resUsers = await axios.get('http://localhost:3000/users').catch(() => axios.get('http://localhost:3000/user'));
      const dadosUsuarios = Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data?.users || []);
      setListaUsuarios(dadosUsuarios);

      const resDiscipline = await axios.get('http://localhost:3000/disciplinas').catch(() => axios.get('http://localhost:3000/disciplina'));
      const dadosDisciplinas = Array.isArray(resDiscipline.data) ? resDiscipline.data : (resDiscipline.data?.disciplinas || []);
      setListaDisciplinas(dadosDisciplinas);

      const resVinculos = await axios.get('http://localhost:3000/academico/vinculos').catch(() => ({ data: [] }));
      setListaVinculos(Array.isArray(resVinculos.data) ? resVinculos.data : []);

      const resDesempenho = await axios.get('http://localhost:3000/academico/desempenho').catch(() => ({ data: [] }));
      setListaDesempenho(Array.isArray(resDesempenho.data) ? resDesempenho.data : []);

      // --- AJUSTE FEITO AQUI ---
      const mentorIdReal = usuarioLogado?.id;
      const urlMonitorias = (usuarioLogado && usuarioLogado.tipo === 'mentor')
        ? `http://localhost:3000/academico/monitorias/mentor/${mentorIdReal}`
        : 'http://localhost:3000/academico/monitorias';
      
      const resMonit = await axios.get(urlMonitorias).catch(() => ({ data: [] }));
      setListaMonitorias(Array.isArray(resMonit.data) ? resMonit.data : []);
    } catch (err) {
      console.error("Falha ao ler dados do banco de dados SQLite", err);
    }
  };

  useEffect(() => {
    if (perfil !== 'publico') {
      carregarDadosDoBanco();
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
      setPerfil(user.tipo ? user.tipo.toLowerCase() : (user.role ? user.role.toLowerCase() : 'publico'));
    } catch (err) {
      setErroApi(err.response?.data?.error || 'Acesso negado. Verifique suas credenciais.');
    }
  };

  const exportarParaExcel = () => {
    if (listaDesempenho.length === 0) {
      alert("Nenhum dado de desempenho cadastrado para exportar.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Aluno,Disciplina,Nota Inicial,Nota Intermediaria,Nota Final,DestaqueSemestre\n";
    listaDesempenho.forEach(d => {
      csvContent += `${d.id},${d.aluno_nome || d.aluno},${d.disciplina_nome || d.disciplina},${d.nota_inicial},${d.nota_intermediaria},${d.nota_final},${d.destaque === 1 ? 'SIM' : 'NAO'}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_desempenho_mentorhub.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    dispararMensagemSucesso("Planilha gerada com sucesso!");
  };

  const handleSalvarUsuario = async (dados) => {
    try {
      if (itemEmEdicao) {
        await axios.put(`http://localhost:3000/users/${itemEmEdicao.id}`, dados).catch(() => axios.put(`http://localhost:3000/user/${itemEmEdicao.id}`, dados));
        dispararMensagemSucesso(`Alterações salvas com sucesso.`);
      } else {
        await axios.post('http://localhost:3000/auth/register', dados);
        dispararMensagemSucesso(`Usuário criado com sucesso.`);
      }
      setExibirModalCadastro(false);
      carregarDadosDoBanco();
    } catch (err) { setErroApi('Erro operacional ao salvar usuário.'); }
  };

  const handleDeletarUsuario = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja remover permanentemente ${nome}?`)) {
      try {
        await axios.delete(`http://localhost:3000/users/${id}`).catch(() => axios.delete(`http://localhost:3000/user/${id}`));
        dispararMensagemSucesso('Registro removido do ecossistema.');
        carregarDadosDoBanco();
      } catch (err) { setErroApi('Erro ao deletar usuário.'); }
    }
  };

  const handleSalvarDisciplina = async (dados) => {
    try {
      if (itemEmEdicao) {
        await axios.put(`http://localhost:3000/disciplinas/${itemEmEdicao.id}`, dados).catch(() => axios.put(`http://localhost:3000/disciplina/${itemEmEdicao.id}`, dados));
        dispararMensagemSucesso(`Disciplina modificada.`);
      } else {
        await axios.post('http://localhost:3000/disciplinas', dados).catch(() => axios.post('http://localhost:3000/disciplina', dados));
        dispararMensagemSucesso(`Disciplina salva com sucesso.`);
      }
      setExibirModalDisciplina(false);
      carregarDadosDoBanco();
    } catch (err) { setErroApi('Erro ao processar disciplina.'); }
  };

  const handleDeletarDisciplina = async (id, nome) => {
    if (window.confirm(`Excluir a disciplina ${nome}?`)) {
      try {
        await axios.delete(`http://localhost:3000/disciplinas/${id}`).catch(() => axios.delete(`http://localhost:3000/disciplina/${id}`));
        dispararMensagemSucesso('Disciplina removida.');
        carregarDadosDoBanco();
      } catch (err) { setErroApi('Erro ao deletar disciplina.'); }
    }
  };

  const handleSalvarVinculo = async (dados) => {
    try {
      await axios.post('http://localhost:3000/academico/vinculos', dados);
      dispararMensagemSucesso('Atribuição acadêmica realizada com sucesso!');
      setExibirModalVinculo(false);
      resetVinculoForm();
      carregarDadosDoBanco();
    } catch (err) { setErroApi('Falha ao criar atribuição.'); }
  };

const handleSalvarMonitoria = async (dados) => {
  try {
    const payload = {
      vinculo_id: alunoSelecionadoParaMonitoria.id, // O ID do item da tabela de vínculos do mentor é o vinculo_id requisitado
      data: dados.data,
      descricao: dados.descricao
    };

    await axios.post('http://localhost:3000/academico/monitorias', payload);
    dispararMensagemSucesso('Sessão registrada no histórico com sucesso!');
    setExibirModalMonitoria(false);
    resetMonitForm();
    carregarDadosDoBanco();
  } catch (err) { 
    setErroApi('Erro ao arquivar monitoria: Verifique os parâmetros enviados.'); 
  }
};

  // 🔥 SOLUÇÃO DEFINITIVA DO SALVAMENTO DE NOTAS (Payload Duplo / Flexível)
const handleSalvarNotasDesempenho = async (dados) => {
  try {
    // Buscamos o ID real varrendo a lista de usuários e disciplinas para garantir o ID numérico correto do banco
    const alunoReal = listaUsuarios.find(u => (u.nome || u.name) === (alunoSelecionadoParaNotas.aluno_nome || alunoSelecionadoParaNotas.aluno));
    const discReal = listaDisciplinas.find(d => d.nome === (alunoSelecionadoParaNotas.disciplina_nome || alunoSelecionadoParaNotas.disciplina));

    const payload = {
      aluno_id: alunoReal ? alunoReal.id : (alunoSelecionadoParaNotas.aluno_id || alunoSelecionadoParaNotas.id),
      disciplina_id: discReal ? discReal.id : alunoSelecionadoParaNotas.disciplina_id,
      nota_inicial: parseFloat(dados.nota_inicial),
      nota_intermediaria: parseFloat(dados.nota_intermediaria),
      nota_final: parseFloat(dados.nota_final),
      destaque: dados.destaque ? 1 : 0
    };
    
    await axios.post('http://localhost:3000/academico/desempenho', payload);
    dispararMensagemSucesso('Boletim de evolução e destaque atualizados com sucesso!');
    setExibirModalNotas(false);
    resetNotasForm();
    carregarDadosDoBanco();
  } catch (err) { 
    setErroApi('Falha na persistência: Verifique se os campos de notas estão preenchidos corretamente.'); 
  }
};

  const abrirEdicaoUsuario = (usuario) => {
    setItemEmEdicao(usuario);
    setExibirModalCadastro(true);
    setTimeout(() => {
      setValueUser("nome", usuario.nome || usuario.name);
      setValueUser("email", usuario.email);
      setValueUser("tipo", usuario.tipo || usuario.tipoUsuario || usuario.role);
    }, 50);
  };

  const abrirEdicaoDisciplina = (disciplina) => {
    setItemEmEdicao(disciplina);
    setExibirModalDisciplina(true);
    setTimeout(() => {
      setValueDisc("nome", disciplina.nome);
      setValueDisc("codigo", disciplina.codigo);
      setValueDisc("cargaHoraria", disciplina.cargaHoraria);
    }, 50);
  };

  const handleLogout = () => {
    localStorage.removeItem('@MentorHub:token');
    setUsuarioLogado(null);
    setPerfil('publico');
  };

  // 🔍 TRATAMENTO MULTI-PROPRIEDADE PARA ALUNOS E MENTORES NÃO SUMIREM MAIS DAS ESTATÍSTICAS
  const alunosCadastrados = listaUsuarios.filter(u => {
    const cargo = String(u.tipo || u.tipoUsuario || u.role || '').toLowerCase();
    return cargo === 'aluno';
  });

  const mentoresCadastrados = listaUsuarios.filter(u => {
    const cargo = String(u.tipo || u.tipoUsuario || u.role || '').toLowerCase();
    return cargo === 'mentor';
  });
  
  const meusAlunosVinculados = listaVinculos.filter(v => {
    if (!usuarioLogado) return false;
    const mentorNomeLogado = (usuarioLogado.nome || usuarioLogado.name || '').toLowerCase();
    const matchId = String(v.mentor_id) === String(usuarioLogado.id);
    const matchEmail = v.mentor_email && v.mentor_email.toLowerCase() === usuarioLogado.email?.toLowerCase();
    const matchNome = v.mentor_nome && v.mentor_nome.toLowerCase() === mentorNomeLogado;
    const matchNomeDireto = v.mentor && v.mentor.toLowerCase() === mentorNomeLogado;
    return matchId || matchEmail || matchNome || matchNomeDireto;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', margin: 0 }}>
      
      {/* SIDEBAR NAVEGACIONAL */}
      <aside style={{ width: '270px', backgroundColor: '#0d233a', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>MentorHub</h2>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Painel Acadêmico</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
          {perfil === 'admin' && (
            <>
              <button onClick={() => setAbaAtiva('geral')} style={{ background: abaAtiva === 'geral' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}>📊 Visão Geral</button>
              <button onClick={() => setAbaAtiva('alunos')} style={{ background: abaAtiva === 'alunos' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}>👨‍🎓 Alunos & Desempenho</button>
              <button onClick={() => setAbaAtiva('mentores')} style={{ background: abaAtiva === 'mentores' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}>👨‍🏫 Mentores</button>
              <button onClick={() => setAbaAtiva('disciplinas')} style={{ background: abaAtiva === 'disciplinas' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}>📚 Disciplinas</button>
              <button onClick={() => setAbaAtiva('atribuir')} style={{ background: abaAtiva === 'atribuir' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}>🔗 Atribuições / Vínculos</button>
              <button onClick={() => setAbaAtiva('relatorios_gerais')} style={{ background: abaAtiva === 'relatorios_gerais' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}>📋 Relatórios de Monitoria</button>
            </>
          )}

          {perfil === 'mentor' && (
            <>
              <button onClick={() => setAbaAtiva('alunos')} style={{ background: abaAtiva === 'alunos' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}>👨‍🎓 Painel de Alunos & Gráficos</button>
              <button onClick={() => setAbaAtiva('mentor_alunos')} style={{ background: abaAtiva === 'mentor_alunos' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}>🛠️ Área de Lançamentos</button>
              <button onClick={() => setAbaAtiva('relatorios_gerais')} style={{ background: abaAtiva === 'relatorios_gerais' ? 'rgba(255,255,255,0.1)' : 'none', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer' }}>📋 Histórico de Monitorias</button>
            </>
          )}
        </nav>

{perfil !== 'publico' && (
  <div style={{ borderTop: '1px solid #1e293b', paddingTop: '15px' }}>
    <span style={{ fontSize: '13px', display: 'block', marginBottom: '10px', color: '#cbd5e1' }}>
      Conectado como: <br/>
      <strong style={{ color: 'white' }}>{usuarioLogado?.nome || usuarioLogado?.name || 'Usuário'}</strong> ({perfil.toUpperCase()})
    </span>
    
    {/* --- ETAPA 1: EXIBIÇÃO DA DISCIPLINA DO MENTOR --- */}
    {perfil === 'mentor' && (
      <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px', marginBottom: '12px', fontSize: '12px', borderLeft: '3px solid #3b82f6' }}>
        <span style={{ color: '#94a3b8', display: 'block' }}>📚 Disciplina Monitorada:</span>
        <strong style={{ color: '#f8fafc' }}>
          {meusAlunosVinculados[0]?.disciplina_nome || meusAlunosVinculados[0]?.disciplina || "Nenhuma cadastrada"}
        </strong>
      </div>
    )}
    {/* ------------------------------------------------- */}

    <button onClick={handleLogout} style={{ width: '100%', backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
  </div>
)}
      </aside>

      {/* PAINEL DE CONTEÚDO PRINCIPAL */}
      <main style={{ flexGrow: 1, padding: '40px' }}>
        {mensagemSucesso && (
          <div style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '14px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #a7f3d0', fontWeight: 'bold' }}>
            ✅ {mensagemSucesso}
          </div>
        )}
        {erroApi && <div style={{ backgroundColor: '#ffeeec', color: '#ef4444', padding: '12px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #fca5a5', fontWeight: 'bold' }}>⚠️ {erroApi}</div>}

        {/* TELA DE AUTENTICAÇÃO */}
        {perfil === 'publico' && (
          <div style={{ maxWidth: '450px', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', margin: '100px auto' }}>
            <h3 style={{ textAlign: 'center', color: '#0d233a', marginBottom: '20px' }}>Acessar o Sistema Integrado</h3>
            <form onSubmit={handleSubmitLogin(handleLoginReal)}>
              <div style={{ marginBottom: '15px' }}><label style={{ fontWeight: 'bold', fontSize: '14px' }}>E-mail:</label><input type="email" {...registerLogin("email", { required: true })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' }} /></div>
              <div style={{ marginBottom: '20px' }}><label style={{ fontWeight: 'bold', fontSize: '14px' }}>Senha:</label><input type="password" {...registerLogin("senha", { required: true })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' }} /></div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#0d233a', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Entrar</button>
            </form>
          </div>
        )}

        {/* COMPONENTES SECUNDÁRIOS AUTENTICADOS */}
        {perfil !== 'publico' && (
          <div>
            {abaAtiva === 'geral' && (
              <div>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <h1>Estatísticas Gerais do Sistema</h1>
                  <p style={{ color: '#64748b' }}>Acompanhamento operacional em tempo real.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '40px' }}>👨‍🎓</span><h3>Alunos</h3><p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{alunosCadastrados.length}</p>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '40px' }}>👨‍🏫</span><h3>Mentores</h3><p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{mentoresCadastrados.length}</p>
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '40px' }}>📚</span><h3>Disciplinas</h3><p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{listaDisciplinas.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ABA DE EVOLUÇÃO ACADÊMICA E BOLETIM INTEGRADO */}
            {abaAtiva === 'alunos' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Painel de Gestão e Evolução dos Alunos</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={exportarParaExcel} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📊 Exportar Notas para Excel (CSV)</button>
                    {perfil === 'admin' && (
                      <button onClick={() => { setItemEmEdicao(null); resetUserForm(); setExibirModalCadastro(true); }} style={{ backgroundColor: '#0d233a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Cadastrar Aluno</button>
                    )}
                  </div>
                </div>

                {/* 1. Alunos de Destaque no Período */}
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>🌟 Alunos de Destaque do Semestre</h3>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {listaDesempenho.filter(d => d.destaque === 1).map(d => (
                      <div key={d.id} style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', padding: '15px', borderRadius: '8px', minWidth: '220px' }}>
                        <div style={{ fontWeight: 'bold', color: '#92400e' }}>🏅 {d.aluno_nome || d.aluno}</div>
                        <div style={{ fontSize: '13px', color: '#b45309', marginTop: '3px' }}>Disciplina: {d.disciplina_nome || d.disciplina}</div>
                        <div style={{ fontSize: '12px', marginTop: '8px', fontWeight: 'bold', color: '#78350f', backgroundColor: '#fef08a', display: 'inline-block', padding: '2px 6px', borderRadius: '4px' }}>Média Final: {d.nota_final}</div>
                      </div>
                    ))}
                    {listaDesempenho.filter(d => d.destaque === 1).length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>Nenhum destaque registrado para este período.</p>}
                  </div>
                </div>

                {/* 2. Gráfico Dinâmico */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <h3>📈 Gráfico de Desempenho durante a Mentoria</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Legenda do Progresso Semestral: <span style={{ color: '#ef4444' }}>■ Nota Inicial</span> | <span style={{ color: '#3b82f6' }}>■ Nota Intermediária</span> | <span style={{ color: '#10b981' }}>■ Nota Final (Prova)</span></p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {listaDesempenho.map(d => (
                      <div key={d.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>{d.aluno_nome || d.aluno} — <span style={{ color: '#64748b', fontWeight: 'normal' }}>{d.disciplina_nome || d.disciplina}</span></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', width: '90px', color: '#64748b' }}>Inicial:</span>
                            <div style={{ backgroundColor: '#ef4444', height: '16px', width: `${Math.max(d.nota_inicial * 9, 5)}%`, borderRadius: '4px', color: 'white', fontSize: '11px', fontWeight: 'bold', paddingLeft: '8px', display: 'flex', alignItems: 'center' }}>{d.nota_inicial}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', width: '90px', color: '#64748b' }}>Intermediária:</span>
                            <div style={{ backgroundColor: '#3b82f6', height: '16px', width: `${Math.max(d.nota_intermediaria * 9, 5)}%`, borderRadius: '4px', color: 'white', fontSize: '11px', fontWeight: 'bold', paddingLeft: '8px', display: 'flex', alignItems: 'center' }}>{d.nota_intermediaria}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', width: '90px', color: '#64748b' }}>Final (Prova):</span>
                            <div style={{ backgroundColor: '#10b981', height: '16px', width: `${Math.max(d.nota_final * 9, 5)}%`, borderRadius: '4px', color: 'white', fontSize: '11px', fontWeight: 'bold', paddingLeft: '8px', display: 'flex', alignItems: 'center' }}>{d.nota_final}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {listaDesempenho.length === 0 && <p style={{ color: '#64748b', fontSize: '14px' }}>Nenhum gráfico disponível. Lance notas na Área de Lançamentos.</p>}
                  </div>
                </div>

                {/* 3. Tabela de Alunos */}
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '15px' }}>Nome</th>
                        <th style={{ padding: '15px' }}>E-mail</th>
                        {perfil === 'admin' && <th style={{ padding: '15px', width: '180px' }}>Ações</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {alunosCadastrados.map(a => (
                        <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '15px', fontWeight: 'bold' }}>{a.nome || a.name}</td>
                          <td style={{ padding: '15px' }}>{a.email}</td>
                          {perfil === 'admin' && (
                            <td style={{ padding: '15px', display: 'flex', gap: '8px' }}>
                              <button onClick={() => abrirEdicaoUsuario(a)} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                              <button onClick={() => handleDeletarUsuario(a.id, a.nome || a.name)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Remover</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ABA MENTORES */}
            {abaAtiva === 'mentores' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Gestão de Mentores</h2>
                  {perfil === 'admin' && (
                    <button onClick={() => { setItemEmEdicao(null); resetUserForm(); setExibirModalCadastro(true); }} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Cadastrar Mentor</button>
                  )}
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '15px' }}>Nome</th>
                        <th style={{ padding: '15px' }}>E-mail</th>
                        {perfil === 'admin' && <th style={{ padding: '15px', width: '180px' }}>Ações</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {mentoresCadastrados.map(m => (
                        <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '15px', fontWeight: 'bold' }}>{m.nome || m.name}</td>
                          <td style={{ padding: '15px' }}>{m.email}</td>
                          {perfil === 'admin' && (
                            <td style={{ padding: '15px', display: 'flex', gap: '8px' }}>
                              <button onClick={() => abrirEdicaoUsuario(m)} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                              <button onClick={() => handleDeletarUsuario(m.id, m.nome || m.name)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Remover</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ABA DISCIPLINAS */}
            {abaAtiva === 'disciplinas' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Gestão de Disciplinas</h2>
                  {perfil === 'admin' && (
                    <button onClick={() => { setItemEmEdicao(null); resetDiscForm(); setExibirModalDisciplina(true); }} style={{ backgroundColor: '#0d233a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Adicionar Disciplina</button>
                  )}
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '15px' }}>Código</th>
                        <th style={{ padding: '15px' }}>Nome da Disciplina</th>
                        <th style={{ padding: '15px' }}>Carga Horária</th>
                        {perfil === 'admin' && <th style={{ padding: '15px', width: '180px' }}>Ações</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {listaDisciplinas.map(d => (
                        <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '15px', fontWeight: 'bold', color: '#0369a1' }}>{d.codigo}</td>
                          <td style={{ padding: '15px' }}>{d.nome}</td>
                          <td style={{ padding: '15px' }}>{d.cargaHoraria || d.carga_horaria}h</td>
                          {perfil === 'admin' && (
                            <td style={{ padding: '15px', display: 'flex', gap: '8px' }}>
                              <button onClick={() => abrirEdicaoDisciplina(d)} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Editar</button>
                              <button onClick={() => handleDeletarDisciplina(d.id, d.nome)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Remover</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ABA ATRIBUIÇÕES */}
            {abaAtiva === 'atribuir' && perfil === 'admin' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Vínculos e Atribuições Acadêmicas</h2>
                  <button onClick={() => setExibirModalVinculo(true)} style={{ backgroundColor: '#0d233a', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Atribuir Aluno a Mentor</button>
                </div>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '15px' }}>Aluno</th>
                        <th style={{ padding: '15px' }}>Mentor Designado</th>
                        <th style={{ padding: '15px' }}>Disciplina Mapeada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaVinculos.map(v => (
                        <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '15px', fontWeight: 'bold' }}>{v.aluno_nome || v.aluno}</td>
                          <td style={{ padding: '15px' }}>{v.mentor_nome || v.mentor}</td>
                          <td style={{ padding: '15px' }}><span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>{v.disciplina_nome || v.disciplina}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* HISTÓRICO DE MONITORIAS */}
            {abaAtiva === 'relatorios_gerais' && (
              <div>
                <h2>📋 Histórico de Monitorias</h2>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', marginTop: '20px' }}>
                  {listaMonitorias.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Nenhuma sessão arquivada no sistema.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {listaMonitorias.map(m => (
                        <div key={m.id} style={{ borderLeft: '4px solid #10b981', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '0 8px 8px 0' }}>
                          <strong>👤 Aluno: {m.aluno_nome || m.aluno}</strong>
                          <div>📚 Disciplina: {m.disciplina_nome || m.disciplina}</div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>📅 Data: {m.data} | {m.descricao}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ÁREA DE LANÇAMENTOS (MENTOR) */}
            {abaAtiva === 'mentor_alunos' && perfil === 'mentor' && (
              <div>
                <h2>🛠️ Central de Lançamentos e Acompanhamento do Mentor</h2>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginTop: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '15px' }}>Nome do Aluno</th>
                        <th style={{ padding: '15px' }}>Matéria Monitorada</th>
                        <th style={{ padding: '15px', width: '340px' }}>Ações Obrigatórias</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meusAlunosVinculados.map(v => (
                        <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '15px', fontWeight: 'bold' }}>{v.aluno_nome || v.aluno}</td>
                          <td style={{ padding: '15px' }}>{v.disciplina_nome || v.disciplina}</td>
                          <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                            <button onClick={() => { setAlunoSelecionadoParaNotas(v); setExibirModalNotas(true); }} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📈 Lançar Notas & Destaque</button>
                            <button onClick={() => { setAlunoSelecionadoParaMonitoria(v); setExibirModalMonitoria(true); }} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📅 Registrar Monitoria</button>
                          </td>
                        </tr>
                      ))}
                      {meusAlunosVinculados.length === 0 && (
                        <tr>
                          <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Nenhum aluno atribuído a você ainda.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- MODAIS OPERACIONAIS --- */}
      {exibirModalCadastro && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '350px' }}>
            <h3>{itemEmEdicao ? '⚙️ Alterar Cadastro' : '✨ Novo Usuário'}</h3>
            <form onSubmit={handleSubmitUser(handleSalvarUsuario)}>
              <div style={{ marginBottom: '10px' }}><label>Nome:</label><input type="text" {...registerUser("nome", { required: true })} style={{ width: '100%', padding: '8px' }} /></div>
              <div style={{ marginBottom: '10px' }}><label>E-mail:</label><input type="email" {...registerUser("email", { required: true })} style={{ width: '100%', padding: '8px' }} /></div>
              {!itemEmEdicao && (
                <div style={{ marginBottom: '10px' }}><label>Senha Inicial:</label><input type="password" {...registerUser("senha", { required: true })} style={{ width: '100%', padding: '8px' }} /></div>
              )}
              <div style={{ marginBottom: '15px' }}>
                <label>Perfil:</label>
                <select {...registerUser("tipo", { required: true })} style={{ width: '100%', padding: '8px' }}>
                  <option value="aluno">Aluno</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '6px' }}>Salvar</button>
              <button type="button" onClick={() => setExibirModalCadastro(false)} style={{ width: '100%', background: 'none', border: 'none', marginTop: '10px', color: '#64748b' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {exibirModalDisciplina && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '350px' }}>
            <h3>{itemEmEdicao ? '⚙️ Alterar Disciplina' : '📚 Nova Disciplina'}</h3>
            <form onSubmit={handleSubmitDisc(handleSalvarDisciplina)}>
              <div style={{ marginBottom: '10px' }}><label>Nome:</label><input type="text" {...registerDisc("nome", { required: true })} style={{ width: '100%', padding: '8px' }} /></div>
              <div style={{ marginBottom: '10px' }}><label>Código:</label><input type="text" {...registerDisc("codigo", { required: true })} style={{ width: '100%', padding: '8px' }} /></div>
              <div style={{ marginBottom: '15px' }}><label>Carga Horária:</label><input type="number" {...registerDisc("cargaHoraria", { required: true })} style={{ width: '100%', padding: '8px' }} /></div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#0d233a', color: 'white', padding: '10px', border: 'none', borderRadius: '6px' }}>Salvar</button>
              <button type="button" onClick={() => setExibirModalDisciplina(false)} style={{ width: '100%', background: 'none', border: 'none', marginTop: '10px', color: '#64748b' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {exibirModalVinculo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '350px' }}>
            <h3>Criar Atribuição Acadêmica</h3>
            <form onSubmit={handleSubmitVinculo(handleSalvarVinculo)}>
              <div style={{ marginBottom: '10px' }}>
                <label>Selecionar Aluno:</label>
                <select {...registerVinculo("aluno_id")} style={{ width: '100%', padding: '8px' }}>
                  {alunosCadastrados.map(a => <option key={a.id} value={a.id}>{a.nome || a.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Selecionar Mentor:</label>
                <select {...registerVinculo("mentor_id")} style={{ width: '100%', padding: '8px' }}>
                  {mentoresCadastrados.map(m => <option key={m.id} value={m.id}>{m.nome || m.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Disciplina:</label>
                <select {...registerVinculo("disciplina_id")} style={{ width: '100%', padding: '8px' }}>
                  {listaDisciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#0d233a', color: 'white', padding: '10px', border: 'none', borderRadius: '6px' }}>Efetivar Vínculo</button>
              <button type="button" onClick={() => setExibirModalVinculo(false)} style={{ width: '100%', background: 'none', border: 'none', marginTop: '10px' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LANÇAR NOTAS */}
      {exibirModalNotas && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '380px' }}>
            <h3>Lançamento de Notas</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Aluno: <strong>{alunoSelecionadoParaNotas?.aluno_nome || alunoSelecionadoParaNotas?.aluno}</strong><br/>Matéria: {alunoSelecionadoParaNotas?.disciplina_nome || alunoSelecionadoParaNotas?.disciplina}</p>
            <form onSubmit={handleSubmitNotas(handleSalvarNotasDesempenho)}>
              <div style={{ marginBottom: '10px' }}><label>Nota Inicial:</label><input type="number" min="0" max="10" step="0.1" {...registerNotas("nota_inicial", { required: true })} style={{ width: '100%', padding: '8px' }} /></div>
              <div style={{ marginBottom: '10px' }}><label>Nota Intermediária:</label><input type="number" min="0" max="10" step="0.1" {...registerNotas("nota_intermediaria", { required: true })} style={{ width: '100%', padding: '8px' }} /></div>
              <div style={{ marginBottom: '12px' }}><label>Nota Final (Prova):</label><input type="number" min="0" max="10" step="0.1" {...registerNotas("nota_final", { required: true })} style={{ width: '100%', padding: '8px' }} /></div>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" {...registerNotas("destaque")} id="chkDestaque" />
                <label htmlFor="chkDestaque" style={{ fontSize: '13px', fontWeight: 'bold', color: '#b45309' }}>🌟 Destacar Aluno neste Semestre</label>
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Salvar Relatório de Evolução</button>
              <button type="button" onClick={() => setExibirModalNotas(false)} style={{ width: '100%', background: 'none', border: 'none', marginTop: '10px', color: '#64748b' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR MONITORIA */}
      {exibirModalMonitoria && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '380px' }}>
            <h3>Registrar Encontro de Monitoria</h3>
            <p>Destinatário: <strong>{alunoSelecionadoParaMonitoria?.aluno_nome || alunoSelecionadoParaMonitoria?.aluno}</strong></p>
            <form onSubmit={handleSubmitMonit(handleSalvarMonitoria)}>
              <div style={{ marginBottom: '12px' }}><label>Data:</label><input type="date" {...registerMonit("data", { required: true })} style={{ width: '100%', padding: '8px' }} /></div>
              <div style={{ marginBottom: '20px' }}><label>Sumário:</label><textarea {...registerMonit("descricao", { required: true })} style={{ width: '100%', padding: '8px', height: '80px' }}></textarea></div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Efetivar Registro</button>
              <button type="button" onClick={() => setExibirModalMonitoria(false)} style={{ width: '100%', background: 'none', border: 'none', marginTop: '10px', color: '#64748b' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}