'use client';

// app/listas/[id]/page.js
// Página que mostra os detalhes de uma lista específica e suas tarefas.
// Permite criar nova tarefa, atualizar status, editar e excluir tarefas.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import NovaTarefaForm from '../../../components/NovaTarefaForm';
import TarefaCard from '../../../components/TarefaCard';
import Tarefa from '../../../models/Tarefa';
import ListaDeTarefas from '../../../models/ListaDeTarefas';

export default function ListaDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const listaId = params.id;

  const [lista, setLista] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      setErro('');

      // Verifica se há usuário logado
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push('/login');
        return;
      }

      try {
        // Carrega dados da lista
        const { data: listaRow, error: listaError } = await supabase
          .from('listas')
          .select('*')
          .eq('id', listaId)
          .single();

        if (listaError) {
          throw listaError;
        }

        // Verifica se a lista pertence ao usuário logado
        if (listaRow.usuario_id !== data.user.id) {
          router.push('/dashboard');
          return;
        }

        // Carrega tarefas da lista
        const { data: tarefasRows, error: tarefasError } = await supabase
          .from('tarefas')
          .select('*')
          .eq('lista_id', listaId);

        if (tarefasError) {
          throw tarefasError;
        }

        const listaObj = ListaDeTarefas.fromDbRow(listaRow, tarefasRows);
        setLista(listaObj);
        setTarefas(listaObj.tarefas);
      } catch (e) {
        setErro(e.message || 'Erro ao carregar lista.');
      } finally {
        setCarregando(false);
      }
    };

    if (listaId) {
      carregarDados();
    }
  }, [listaId, router]);

  const handleCriarTarefa = async (dados) => {
    if (!lista) return;

    try {
      const novaTarefa = new Tarefa(
        null,
        dados.titulo,
        dados.descricao,
        dados.data_vencimento,
        'pendente'
      );

      const { data, error } = await supabase
        .from('tarefas')
        .insert({
          id: crypto.randomUUID(),
          lista_id: lista.id,
          titulo: novaTarefa.titulo,
          descricao: novaTarefa.descricao,
          data_vencimento: novaTarefa.dataDeVencimento,
          status: novaTarefa.status
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const tarefaCriada = Tarefa.fromDbRow(data);

      setTarefas((prev) => [...prev, tarefaCriada]);
    } catch (e) {
      setErro(e.message || 'Erro ao criar tarefa.');
    }
  };

  const handleMudarStatus = async (tarefaId, novoStatus) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ status: novoStatus })
        .eq('id', tarefaId);

      if (error) {
        throw error;
      }

      setTarefas((prev) =>
        prev.map((tarefa) =>
          tarefa.id === tarefaId ? { ...tarefa, status: novoStatus } : tarefa
        )
      );
    } catch (e) {
      setErro(e.message || 'Erro ao atualizar status.');
    }
  };

  // Quando clicar em "Editar" em uma tarefa, abrimos um pequeno formulário de edição.
  const handleEditarTarefa = (tarefa) => {
    setTarefaEmEdicao({
      id: tarefa.id,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || '',
      data_vencimento: tarefa.data_vencimento || tarefa.dataDeVencimento || ''
    });
  };

  const cancelarEdicao = () => {
    setTarefaEmEdicao(null);
  };

  const salvarEdicao = async (event) => {
    event.preventDefault();
    if (!tarefaEmEdicao) return;

    try {
      const { error } = await supabase
        .from('tarefas')
        .update({
          titulo: tarefaEmEdicao.titulo,
          descricao: tarefaEmEdicao.descricao,
          data_vencimento: tarefaEmEdicao.data_vencimento
        })
        .eq('id', tarefaEmEdicao.id);

      if (error) {
        throw error;
      }

      setTarefas((prev) =>
        prev.map((t) =>
          t.id === tarefaEmEdicao.id
            ? {
                ...t,
                titulo: tarefaEmEdicao.titulo,
                descricao: tarefaEmEdicao.descricao,
                data_vencimento: tarefaEmEdicao.data_vencimento
              }
            : t
        )
      );

      setTarefaEmEdicao(null);
    } catch (e) {
      setErro(e.message || 'Erro ao editar tarefa.');
    }
  };

  // Quando clicar em "Excluir", mostramos um card de confirmação em vez de window.confirm.
  const handleExcluirTarefa = (tarefaId) => {
    const tarefaEncontrada = tarefas.find((t) => t.id === tarefaId) || null;
    setTarefaParaExcluir(tarefaEncontrada);
  };

  const cancelarExclusao = () => {
    setTarefaParaExcluir(null);
  };

  const confirmarExclusao = async () => {
    if (!tarefaParaExcluir) return;

    try {
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', tarefaParaExcluir.id);

      if (error) {
        throw error;
      }

      setTarefas((prev) =>
        prev.filter((tarefa) => tarefa.id !== tarefaParaExcluir.id)
      );
      setTarefaParaExcluir(null);
    } catch (e) {
      setErro(e.message || 'Erro ao excluir tarefa.');
    }
  };

  if (carregando) {
    return <p className="loading">Carregando lista...</p>;
  }

  if (!lista) {
    return <p>Lista não encontrada.</p>;
  }

  return (
    <section>
      <Link href="/dashboard" className="link back-link">
        ← Voltar ao dashboard
      </Link>
      <div className="lista-header">
        <h2>{lista.nome}</h2>
        <p>{lista.descricao || 'Sem descrição'}</p>
      </div>

      {erro && <p className="error">{erro}</p>}

      <NovaTarefaForm onCriar={handleCriarTarefa} />

      <h3 className="section-title">Tarefas</h3>
      {tarefas.length === 0 && <p>Não há tarefas nesta lista.</p>}

      <div className="grid">
        {tarefas.map((tarefa) => (
          <TarefaCard
            key={tarefa.id}
            tarefa={tarefa}
            onMudarStatus={handleMudarStatus}
            onEditar={handleEditarTarefa}
            onExcluir={handleExcluirTarefa}
          />
        ))}
      </div>

      {tarefaEmEdicao && (
        <div className="modal-overlay">
          <div className="card modal-card">
            <h3>Editar tarefa</h3>
            <form className="edit-form" onSubmit={salvarEdicao}>
              <label className="label">
                Título
                <input
                  className="input"
                  type="text"
                  value={tarefaEmEdicao.titulo}
                  onChange={(e) =>
                    setTarefaEmEdicao({
                      ...tarefaEmEdicao,
                      titulo: e.target.value
                    })
                  }
                  required
                />
              </label>

              <label className="label">
                Descrição
                <input
                  className="input"
                  type="text"
                  value={tarefaEmEdicao.descricao}
                  onChange={(e) =>
                    setTarefaEmEdicao({
                      ...tarefaEmEdicao,
                      descricao: e.target.value
                    })
                  }
                />
              </label>

              <label className="label">
                Data de vencimento
                <input
                  className="input"
                  type="date"
                  value={tarefaEmEdicao.data_vencimento || ''}
                  onChange={(e) =>
                    setTarefaEmEdicao({
                      ...tarefaEmEdicao,
                      data_vencimento: e.target.value
                    })
                  }
                />
              </label>

              <div className="card-actions">
                <button className="button" type="submit">
                  Salvar
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={cancelarEdicao}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tarefaParaExcluir && (
        <div className="modal-overlay">
          <div className="card modal-card">
            <h3>Excluir tarefa</h3>
            <p>
              Tem certeza que deseja excluir a tarefa{' '}
              <strong>{tarefaParaExcluir.titulo}</strong>?
            </p>
            <div className="card-actions">
              <button
                className="button button-danger"
                type="button"
                onClick={confirmarExclusao}
              >
                Excluir
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={cancelarExclusao}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
