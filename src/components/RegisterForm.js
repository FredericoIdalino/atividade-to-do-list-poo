'use client';

// components/RegisterForm.js
// Formulário de registro de novo usuário.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Usuario from '../models/Usuario';

export default function RegisterForm() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Usa método registrar da classe Usuario
      await Usuario.registrar(nome, email, senha);
      router.push('/dashboard');
    } catch (error) {
      setErro(error.message || 'Erro ao registrar usuário.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Registro</h2>

      {erro && <p className="error">{erro}</p>}

      <label className="label">
        Nome
        <input
          className="input"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </label>

      <label className="label">
        Email
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="label">
        Senha
        <input
          className="input"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
      </label>

      <button className="button" type="submit" disabled={carregando}>
        {carregando ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  );
}

