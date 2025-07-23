'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (localStorage.getItem('token')){
      router.push('/todo');
    }
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Todo App</h1>

      <Link href="/login">Login</Link>
      <Link href="/signup">Signup</Link>

    </main>
  );
}