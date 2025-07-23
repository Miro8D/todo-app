'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [user, setUser] = useState('');

  const [changeText, setChangeText] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos`, {
        headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
    })
      .then(res => res.json())
      .then(setTodos);
  }, []);

  const handleAdd = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
    },
      body: JSON.stringify({ text }),
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
    setText('');
  };

  const handleDelete = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    setTodos(todos.filter(t => t.id !== id));
  };

  const handleModify = async text => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos/${editId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
      body: JSON.stringify({ text }),
    });
    const body = await res.json();
    setTodos(todos.map(todo => todo.id === editId ? body : todo));
    setEditId(null);
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Todo App</h1>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="New todo" />
      <button onClick={handleAdd}>Add</button>

      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {editId === todo.id ? <div>
                <input type="text" id="selected" value={changeText} onChange={e => setChangeText(e.target.value)}></input>
                <button onClick={() => handleModify(changeText)}>save</button>
              </div> : todo.text} <button onClick={() => handleDelete(todo.id)}>X</button>
            <button onClick={() => {
                setEditId(todo.id); 
                setChangeText(todo.text);
            }}>M</button>
          </li>
        ))}

      </ul>

    </main>
  );
}