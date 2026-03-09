'use client';

// app/dashboard/page.js
// Dashboard do usuário autenticado.
// Mostra todas as listas e permite criar e excluir listas.
// Esta página é protegida: se não houver usuário logado, redireciona para /login.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import ListaCard from '../../components/ListaCard';
import NovaListaForm from '../../components/NovaListaForm';
import ListaDeTarefas from '../../models/ListaDeTarefas';
import Usuario from '../../models/Usuario';

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [listas, setListas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Verifica usuário logado e carrega listas
  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      setErro('');

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push('/login');
        return;
      }

      try {
        // Busca dados complementares do usuário
        const { data: usuarioRow, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          throw userError;
        }

        const usuarioAtual = new Usuario(
          usuarioRow.id,
          usuarioRow.nome,
          usuarioRow.email,
          usuarioRow.senha,
          []
        );

        setUsuario(usuarioAtual);

        // Usa método OOP para carregar listas
        const listasUsuario = await usuarioAtual.obterListas();
        setListas(listasUsuario);
      } catch (e) {
        setErro(e.message || 'Erro ao carregar dados.');
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [router]);

  const handleCriarLista = async ({ nome, descricao }) => {
    if (!usuario) return;

    try {
      const listaTemp = new ListaDeTarefas(null, nome, descricao, []);
      const novaLista = await usuario.adicionarLista(listaTemp);
      setListas((prev) => [...prev, novaLista]);
    } catch (e) {
      setErro(e.message || 'Erro ao criar lista.');
    }
  };

  const handleExcluirLista = async (listaId) => {
    if (!usuario) return;

    try {
      await usuario.removerLista(listaId);
      setListas((prev) => prev.filter((lista) => lista.id !== listaId));
    } catch (e) {
      setErro(e.message || 'Erro ao excluir lista.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (carregando) {
    return <p>Carregando dashboard...</p>;
  }

  return (
    <section>
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div>
          {usuario && <span className="user-badge">Olá, {usuario.nome}</span>}
          <button className="button button-secondary" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>

      {erro && <p className="error">{erro}</p>}

      <NovaListaForm onCriar={handleCriarLista} />

      <h3>Suas listas</h3>
      {listas.length === 0 && <p>Você ainda não possui listas.</p>}

      <div className="grid">
        {listas.map((lista) => (
          <ListaCard
            key={lista.id}
            lista={lista}
            onExcluir={handleExcluirLista}
          />
        ))}
      </div>
    </section>
  );
}

