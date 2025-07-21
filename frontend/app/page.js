'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/todos')
      .then(res => res.json())
      .then(setTodos);
  }, []);

  const handleAdd = async () => {
    const res = await fetch('http://localhost:5000/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
    setText('');
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/todos/${id}`, {
      method: 'DELETE',
    });
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Todo App</h1>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="New todo" />
      <button onClick={handleAdd}>Add</button>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text} <button onClick={() => handleDelete(todo.id)}>X</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
