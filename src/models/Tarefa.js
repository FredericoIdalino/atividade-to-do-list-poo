// models/Tarefa.js
// Representa uma tarefa individual na aplicação.

export default class Tarefa {
  constructor(id, titulo, descricao, dataDeVencimento, status = 'pendente') {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.dataDeVencimento = dataDeVencimento;
    this.status = status;
  }

  // Atualiza o status da tarefa (pendente, em progresso, concluida)
  atualizarStatus(novoStatus) {
    const statusPermitidos = ['pendente', 'em progresso', 'concluida'];

    if (!statusPermitidos.includes(novoStatus)) {
      throw new Error('Status inválido. Use pendente, em progresso ou concluida.');
    }

    this.status = novoStatus;
  }

  // Atualiza os detalhes principais da tarefa
  atualizarDetalhes(novoTitulo, novaDescricao, novaDataDeVencimento) {
    this.titulo = novoTitulo;
    this.descricao = novaDescricao;
    this.dataDeVencimento = novaDataDeVencimento;
  }

  // Método auxiliar para criar uma instância a partir de um registro do banco
  static fromDbRow(row) {
    return new Tarefa(
      row.id,
      row.titulo,
      row.descricao,
      row.data_vencimento,
      row.status
    );
  }
}

