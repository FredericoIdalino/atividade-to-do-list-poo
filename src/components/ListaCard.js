'use client';

// components/ListaCard.js
// Exibe uma lista de tarefas de forma simples.

import Link from 'next/link';

export default function ListaCard({ lista, onExcluir }) {
  return (
    <div className="card">
      <h3>{lista.nome}</h3>
      <p>{lista.descricao}</p>

      <div className="card-actions">
        <Link className="button button-secondary" href={`/listas/${lista.id}`}>
          Ver tarefas
        </Link>

        {onExcluir && (
          <button
            className="button button-danger"
            onClick={() => onExcluir(lista.id)}
          >
            Excluir lista
          </button>
        )}
      </div>
    </div>
  );
}

