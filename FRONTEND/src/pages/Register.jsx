import { useState } from 'react';
import { api } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'aluno'
  });

  async function handleRegister(e) {
    e.preventDefault();

    const response = await api.register(form);

    if (!response.error) {
      alert('Usuário criado!');
    } else {
      alert(response.error);
    }
  }

  return (
    <div>
      <h2>Cadastro</h2>

      <form onSubmit={handleRegister}>
        <input
          placeholder="Nome"
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />

        <input
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => setForm({ ...form, senha: e.target.value })}
        />

        <select
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
        >
          <option value="aluno">Aluno</option>
          <option value="mentor">Mentor</option>
        </select>

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}