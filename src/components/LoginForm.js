'use client';

// components/LoginForm.js
// Formulário de login de usuário.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Usuario from '../models/Usuario';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Usa o método de login da classe Usuario (OOP)
      await Usuario.login(email, senha);
      router.push('/dashboard');
    } catch (error) {
      setErro(error.message || 'Erro ao fazer login.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Login</h2>

      {erro && <p className="error">{erro}</p>}

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
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}

