// app/layout.js
// Layout raiz da aplicação. Carrega o CSS global.

import '../styles/globals.css';

export const metadata = {
  title: 'Sistema de Tarefas',
  description: 'Projeto acadêmico de lista de tarefas com Next.js e Supabase'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="header">
          <div className="container header-content">
            <h1 className="logo">Task Manager</h1>
          </div>
        </header>
        <main className="container main-content">{children}</main>
        <footer className="footer">
          <div className="container">
            <p>Sistema de tarefas - Projeto acadêmico</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

