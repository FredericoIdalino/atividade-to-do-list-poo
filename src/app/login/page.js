'use client';

// app/login/page.js
// Página de login que utiliza o componente LoginForm.

import Link from 'next/link';
import LoginForm from '../../components/LoginForm';

export default function LoginPage() {
  return (
    <section className="auth-page">
      <LoginForm />
      <p className="helper-text">
        Ainda não tem conta?{' '}
        <Link href="/registro" className="link">
          Registre-se aqui.
        </Link>
      </p>
    </section>
  );
}

