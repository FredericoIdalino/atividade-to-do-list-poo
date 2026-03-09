// app/page.js
// Página inicial simples com botões para login e registro.

import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="home">
      <h2>Bem-vindo ao Sistema de Tarefas</h2>
      <p>Gerencie suas listas de tarefas de forma simples.</p>

      <div className="home-actions">
        <Link className="button" href="/login">
          Fazer Login
        </Link>
        <Link className="button button-secondary" href="/registro">
          Registrar
        </Link>
      </div>
    </section>
  );
}

