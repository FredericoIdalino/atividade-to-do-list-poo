'use client';

// components/NovaListaForm.js
// Formulário simples para criar uma nova lista de tarefas.

import { useState } from 'react';

export default function NovaListaForm({ onCriar }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!nome.trim()) {
      return;
    }

    onCriar({ nome, descricao });
    setNome('');
    setDescricao('');
  };

  return (
    <form className="form inline-form" onSubmit={handleSubmit}>
      <h3>Criar nova lista</h3>

      <label className="label">
        Nome da lista
        <input
          className="input"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </label>

      <label className="label">
        Descrição
        <input
          className="input"
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </label>

      <button className="button" type="submit">
        Criar lista
      </button>
    </form>
  );
}

