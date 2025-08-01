'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token){
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
          localStorage.removeItem('token');
          router.push('/login');
        } else router.push('/todo');
      } catch (err) {
        console.error('Failed to decode JWT:', err);
        localStorage.removeItem('token');
      }
    } else return;
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Todo App</h1>

      <Link href="/login">Login</Link>
      <Link href="/signup">Signup</Link>

    </main>
  );
}