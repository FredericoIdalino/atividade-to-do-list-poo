// models/Usuario.js
// Representa o usuário do sistema e centraliza operações
// relacionadas a autenticação e listas do usuário.

import { supabase } from '../lib/supabaseClient';
import ListaDeTarefas from './ListaDeTarefas';
import Tarefa from './Tarefa';

export default class Usuario {
  constructor(id, nome, email, senha, listas = []) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.listas = listas; // array de ListaDeTarefas
  }

  // REGISTRAR NOVO USUÁRIO
  // Cria usuário no Supabase Auth e na tabela usuarios.
  static async registrar(nome, email, senha) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha
    });

    if (error) {
      throw error;
    }

    const user = data.user;

    // IMPORTANTE: Armazenar senha em texto puro NÃO é seguro em sistemas reais.
    // Aqui é apenas para fins acadêmicos.
    const { error: insertError } = await supabase.from('usuarios').insert({
      id: user.id,
      nome,
      email,
      senha
    });

    if (insertError) {
      throw insertError;
    }

    return new Usuario(user.id, nome, email, senha, []);
  }

  // LOGIN DO USUÁRIO
  static async login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      throw error;
    }

    const user = data.user;

    const { data: usuarioRow, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      throw userError;
    }

    return new Usuario(
      usuarioRow.id,
      usuarioRow.nome,
      usuarioRow.email,
      usuarioRow.senha,
      []
    );
  }

  // OBTÉM LISTAS DO USUÁRIO A PARTIR DO BANCO
  async obterListas() {
    const { data: listasRows, error } = await supabase
      .from('listas')
      .select('*')
      .eq('usuario_id', this.id);

    if (error) {
      throw error;
    }

    this.listas = listasRows.map(
      (row) => new ListaDeTarefas(row.id, row.nome, row.descricao, [])
    );

    return this.listas;
  }

  // ADICIONA UMA NOVA LISTA NO BANCO E NO OBJETO
  async adicionarLista(lista) {
    const { data, error } = await supabase
      .from('listas')
      .insert({
        id: lista.id,
        usuario_id: this.id,
        nome: lista.nome,
        descricao: lista.descricao
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const novaLista = new ListaDeTarefas(
      data.id,
      data.nome,
      data.descricao,
      []
    );

    this.listas.push(novaLista);

    return novaLista;
  }

  // REMOVE LISTA PELO ID (BANCO + OBJETO)
  async removerLista(listaId) {
    const { error } = await supabase.from('listas').delete().eq('id', listaId);

    if (error) {
      throw error;
    }

    this.listas = this.listas.filter((lista) => lista.id !== listaId);
  }

  // Métodos auxiliares para lidar com tarefas de uma lista específica

  async obterTarefasDaLista(listaId) {
    const { data: tarefasRows, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('lista_id', listaId);

    if (error) {
      throw error;
    }

    return tarefasRows.map((row) => Tarefa.fromDbRow(row));
  }

  async adicionarTarefaNaLista(listaId, tarefa) {
    const { data, error } = await supabase
      .from('tarefas')
      .insert({
        id: tarefa.id,
        lista_id: listaId,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        data_vencimento: tarefa.dataDeVencimento,
        status: tarefa.status
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Tarefa.fromDbRow(data);
  }
}

