'use client';

// components/NovaTarefaForm.js
// Formulário simples para criar uma nova tarefa em uma lista.

import { useState } from 'react';

export default function NovaTarefaForm({ onCriar }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!titulo.trim()) {
      return;
    }

    onCriar({
      titulo,
      descricao,
      data_vencimento: dataVencimento
    });

    setTitulo('');
    setDescricao('');
    setDataVencimento('');
  };

  return (
    <form className="form inline-form" onSubmit={handleSubmit}>
      <h3>Nova tarefa</h3>

      <label className="label">
        Título
        <input
          className="input"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
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

      <label className="label">
        Data de vencimento
        <input
          className="input"
          type="date"
          value={dataVencimento}
          onChange={(e) => setDataVencimento(e.target.value)}
        />
      </label>

      <button className="button" type="submit">
        Adicionar tarefa
      </button>
    </form>
  );
}

