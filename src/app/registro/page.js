'use client';

// app/registro/page.js
// Página de registro que utiliza o componente RegisterForm.

import Link from 'next/link';
import RegisterForm from '../../components/RegisterForm';

export default function RegistroPage() {
  return (
    <section>
      <RegisterForm />
      <p className="helper-text">
        Já possui conta?{' '}
        <Link href="/login" className="link">
          Faça login.
        </Link>
      </p>
    </section>
  );
}

