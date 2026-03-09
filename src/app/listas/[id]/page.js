// app/listas/[id]/page.js
// Página que mostra os detalhes de uma lista específica e suas tarefas.
// Permite criar nova tarefa, atualizar status, editar e excluir tarefas.

'use client';

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

  const handleEditarTarefa = async (tarefa) => {
    // Para manter o projeto simples, usamos prompts nativos
    const novoTitulo = window.prompt('Novo título:', tarefa.titulo);
    if (novoTitulo === null) return;

    const novaDescricao = window.prompt('Nova descrição:', tarefa.descricao);
    if (novaDescricao === null) return;

    const novaData = window.prompt(
      'Nova data de vencimento (YYYY-MM-DD):',
      tarefa.data_vencimento || tarefa.dataDeVencimento || ''
    );
    if (novaData === null) return;

    try {
      const { error } = await supabase
        .from('tarefas')
        .update({
          titulo: novoTitulo,
          descricao: novaDescricao,
          data_vencimento: novaData
        })
        .eq('id', tarefa.id);

      if (error) {
        throw error;
      }

      setTarefas((prev) =>
        prev.map((t) =>
          t.id === tarefa.id
            ? {
                ...t,
                titulo: novoTitulo,
                descricao: novaDescricao,
                data_vencimento: novaData
              }
            : t
        )
      );
    } catch (e) {
      setErro(e.message || 'Erro ao editar tarefa.');
    }
  };

  const handleExcluirTarefa = async (tarefaId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', tarefaId);

      if (error) {
        throw error;
      }

      setTarefas((prev) => prev.filter((tarefa) => tarefa.id !== tarefaId));
    } catch (e) {
      setErro(e.message || 'Erro ao excluir tarefa.');
    }
  };

  if (carregando) {
    return <p>Carregando lista...</p>;
  }

  if (!lista) {
    return <p>Lista não encontrada.</p>;
  }

  return (
    <section>
      <h2>{lista.nome}</h2>
      <p>{lista.descricao}</p>

      {erro && <p className="error">{erro}</p>}

      <NovaTarefaForm onCriar={handleCriarTarefa} />

      <h3>Tarefas</h3>
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
    </section>
  );
}

// app/listas/[id]/page.js
// Página que mostra os detalhes de uma lista específica e suas tarefas.
// Permite criar nova tarefa, atualizar status, editar e excluir tarefas.

'use client';

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

  const handleEditarTarefa = async (tarefa) => {
    // Para manter o projeto simples, usamos prompts nativos
    const novoTitulo = window.prompt('Novo título:', tarefa.titulo);
    if (novoTitulo === null) return;

    const novaDescricao = window.prompt('Nova descrição:', tarefa.descricao);
    if (novaDescricao === null) return;

    const novaData = window.prompt(
      'Nova data de vencimento (YYYY-MM-DD):',
      tarefa.data_vencimento || tarefa.dataDeVencimento || ''
    );
    if (novaData === null) return;

    try {
      const { error } = await supabase
        .from('tarefas')
        .update({
          titulo: novoTitulo,
          descricao: novaDescricao,
          data_vencimento: novaData
        })
        .eq('id', tarefa.id);

      if (error) {
        throw error;
      }

      setTarefas((prev) =>
        prev.map((t) =>
          t.id === tarefa.id
            ? {
                ...t,
                titulo: novoTitulo,
                descricao: novaDescricao,
                data_vencimento: novaData
              }
            : t
        )
      );
    } catch (e) {
      setErro(e.message || 'Erro ao editar tarefa.');
    }
  };

  const handleExcluirTarefa = async (tarefaId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', tarefaId);

      if (error) {
        throw error;
      }

      setTarefas((prev) => prev.filter((tarefa) => tarefa.id !== tarefaId));
    } catch (e) {
      setErro(e.message || 'Erro ao excluir tarefa.');
    }
  };

  if (carregando) {
    return <p>Carregando lista...</p>;
  }

  if (!lista) {
    return <p>Lista não encontrada.</p>;
  }

  return (
    <section>
      <h2>{lista.nome}</h2>
      <p>{lista.descricao}</p>

      {erro && <p className="error">{erro}</p>}

      <NovaTarefaForm onCriar={handleCriarTarefa} />

      <h3>Tarefas</h3>
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
    </section>
  );
}
