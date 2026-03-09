// models/ListaDeTarefas.js
// Representa uma lista de tarefas que pertence a um usuário.

import Tarefa from './Tarefa';

export default class ListaDeTarefas {
  constructor(id, nome, descricao, tarefas = []) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.tarefas = tarefas; // array de Tarefa
  }

  // Adiciona uma tarefa ao array local
  adicionarTarefa(tarefa) {
    this.tarefas.push(tarefa);
  }

  // Remove uma tarefa pelo id
  removerTarefa(tarefaId) {
    this.tarefas = this.tarefas.filter((tarefa) => tarefa.id !== tarefaId);
  }

  // Retorna todas as tarefas
  obterTarefas() {
    return this.tarefas;
  }

  // Atualiza uma tarefa específica
  atualizarTarefa(tarefaAtualizada) {
    this.tarefas = this.tarefas.map((tarefa) =>
      tarefa.id === tarefaAtualizada.id ? tarefaAtualizada : tarefa
    );
  }

  // Cria uma instância a partir da linha do banco + tarefas relacionadas
  static fromDbRow(row, tarefasRows = []) {
    const tarefas = tarefasRows.map((tarefaRow) => Tarefa.fromDbRow(tarefaRow));

    return new ListaDeTarefas(row.id, row.nome, row.descricao, tarefas);
  }
}

