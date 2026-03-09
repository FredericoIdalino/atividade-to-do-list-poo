'use client';

// components/TarefaCard.js
// Exibe uma tarefa com ações de atualizar status, editar e excluir.

import { useState } from 'react';

export default function TarefaCard({
  tarefa,
  onMudarStatus,
  onEditar,
  onExcluir
}) {
  const [novoStatus, setNovoStatus] = useState(tarefa.status);

  const handleStatusChange = (event) => {
    const value = event.target.value;
    setNovoStatus(value);
    onMudarStatus(tarefa.id, value);
  };

  return (
    <div className="card tarefa-card">
      <h4>{tarefa.titulo}</h4>
      <p>{tarefa.descricao}</p>
      <p>
        <strong>Vencimento:</strong>{' '}
        {tarefa.data_vencimento || tarefa.dataDeVencimento || 'Sem data'}
      </p>
      <p>
        <strong>Status:</strong>
        <select
          className="select"
          value={novoStatus}
          onChange={handleStatusChange}
        >
          <option value="pendente">Pendente</option>
          <option value="em progresso">Em progresso</option>
          <option value="concluida">Concluída</option>
        </select>
      </p>

      <div className="card-actions">
        <button
          className="button button-secondary"
          onClick={() => onEditar(tarefa)}
        >
          Editar
        </button>
        <button
          className="button button-danger"
          onClick={() => onExcluir(tarefa.id)}
        >
          Excluir
        </button>
      </div>
    </div>
  );
}

