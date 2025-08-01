'use client';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function checkToken() {
  const token = localStorage.getItem('token')
  if (token){
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem('token');
        return 0;
      } else return 1;        // Returns 1 if its succesful, 0 if failed
    } catch (err) {
      console.error('Failed to decode JWT:', err);
      localStorage.removeItem('token');
      return 0;
    }
  } else return 0;
}
export default function Home() {
    const router = useRouter();

    const logout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };
    
    const [user, setUser] = useState(null);
    
    const fetchApi = async (token, uri, options = {}) => {
        if (uri[0] === '/') {
            uri = uri.substring(1);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${uri}`, {
            ...options,
            headers: { 
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        });
        const json = await response.json();
        
        if (!response.ok) {
            throw json?.errorMessage || response.statusText;
        }

        if (json) return json;
    };

    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imageURL, setImageURL] = useState('');

    const [changeTitle, setChangeTitle] = useState('');
    const [changeDescription, setChangeDescription] = useState('');
    const [changeImage, setChangeImage] = useState(null);
    const [changeImageURL, setChangeImageURL] = useState('');
    const [changeId, setChangeId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!checkToken()) logout();
        try {
          setUser(jwtDecode(token));
        } catch (err) {
          console.error(err)
        }
        fetchApi(localStorage.getItem("token"), '/api/todos').then(todos => setTodos(todos)).catch(err => alert(err));
    }, []);

    const handleAdd = async () => {
        if (!checkToken()) logout();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (image) {
            formData.append('image', image);
        }

        try {
            const newTodo = await fetchApi(localStorage.getItem("token"), `/api/todos`, {
                method: 'POST',
                body: formData,
            });
            setTodos([...todos, newTodo]);
            setTitle('');
            setDescription('');
            setImage(null);
            setImageURL("");
        } catch (err) {
            alert(err);
        }
    };

    const handleDelete = async id => {
        if (!checkToken()) logout();
        try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
            });
            setTodos(todos.filter(t => t.id !== id));
        } catch (err) {alert(err)}
    };

    const handleChange = async (title, description) => {
        if (!checkToken()) logout();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (changeImage) {
          formData.append('image', changeImage);
        }
        try {
            const body = await fetchApi(localStorage.getItem("token"), `/api/todos/${changeId}`, {
                method: 'PATCH',
                body: formData,
        });
        setTodos(todos.map(todo => todo.id === changeId ? body : todo));
        setChangeId(null);
        setChangeTitle('');
        setChangeDescription('');
        setChangeImage(null);
        setChangeImageURL('');
        } catch (err) {
            alert(err);
        }
    };

    const setChange = todo => {
        setChangeId(todo.id);
        setChangeTitle(todo.title);
        setChangeDescription(todo.description);
        setChangeImage(todo.image);
        setChangeImageURL(todo.image_url);
    };

    return (
        <main style={{ padding: '2rem' }}>
            <h1>Todo App</h1>
            <h2>Logged in as <b>{user?.username}</b></h2>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New todo" />
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder='Description' />
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
            <button onClick={handleAdd}>Add</button>

            <ul>
                {todos.map(todo => (
                    <li key={todo.id}>
                        {changeId === todo.id 
                            ? <div>
                                <input type="title" id="selected" value={changeTitle} onChange={e => setChangeTitle(e.target.value)} />
                                <input type="description" id='selected-desc' value={changeDescription} onChange={e => setChangeDescription(e.target.value)} />
                                <input type="file" accept="image/*" onChange={e => setChangeImage(e.target.files[0])} />
                                <button onClick={() => handleChange(changeTitle, changeDescription)}>save</button>
                              </div> 
                            : <span>
                                {todo.title} - <i>{todo.description}</i> 
                                {todo.image_url && <img src={`${process.env.NEXT_PUBLIC_API_URL}/${todo.image_url}`} alt="todo" style={{ maxWidth: '100px', maxHeight: '100px', marginLeft: '1rem' }} />}
                              </span>
                        }
                        <button onClick={() => handleDelete(todo.id)}>X</button>
                        <button onClick={() => setChange(todo)}>M</button>
                    </li>
                ))}

            </ul>
            <button onClick={logout}>Logout</button>
        </main>
    );
}