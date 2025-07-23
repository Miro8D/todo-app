"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

    const router = useRouter();

    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");

    const handleLogin = async (user, pass) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/login`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({username:user, password:btoa(pass)}),
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("token", data.token);
            router.push('/todo');
        } else {
            alert("Login failed");
        }
    };


    return (
    <div className="p-6">
        <h1 className="text-2xl mb-4">Login</h1>
        <form
            onSubmit={(e)=>{
                e.preventDefault();
                handleLogin(user, pass);
            }}
        >
            <input value={user} onChange={e=>setUser(e.target.value)} type="text" placeholder="Username" className="border p-2 mb-2 block" />
            <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Password" className="border p-2 mb-2 block" />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
        </form>
    </div>
  );
}