'use client';

// app/listas/page.js
// Página simples que mostra todas as listas do usuário logado.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import ListaCard from '../../components/ListaCard';
import Usuario from '../../models/Usuario';

export default function ListasPage() {
  const router = useRouter();
  const [listas, setListas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const carregarListas = async () => {
      setCarregando(true);
      setErro('');

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push('/login');
        return;
      }

      try {
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

        const listasUsuario = await usuarioAtual.obterListas();
        setListas(listasUsuario);
      } catch (e) {
        setErro(e.message || 'Erro ao carregar listas.');
      } finally {
        setCarregando(false);
      }
    };

    carregarListas();
  }, [router]);

  if (carregando) {
    return <p className="loading">Carregando listas...</p>;
  }

  return (
    <section>
      <h2 className="section-title">Listas de tarefas</h2>
      {erro && <p className="error">{erro}</p>}
      {listas.length === 0 && <p>Nenhuma lista encontrada.</p>}

      <div className="grid">
        {listas.map((lista) => (
          <ListaCard key={lista.id} lista={lista} />
        ))}
      </div>
    </section>
  );
}
