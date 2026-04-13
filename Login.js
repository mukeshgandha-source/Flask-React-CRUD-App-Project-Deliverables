import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ toggleForm }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://127.0.0.1:5000/login', { username, password });
            
            // 1. Success Message
            alert("Login Successful! Welcome " + res.data.username);
            
            // 2. Token AUR Username dono save karna zaroori hai
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('username', res.data.username); // ✨ Fixed: Ab naam save ho raha hai
            
            // 3. 🚀 Page reload taaki App.js dashboard switch kar sake
            window.location.reload(); 

        } catch (err) {
            alert("Galti! Username ya Password sahi nahi hai.");
        }
    };

    return (
        <div className="card shadow-lg border-0 mx-auto" style={{ maxWidth: '500px', borderRadius: '15px' }}>
            <div className="card-body p-5">
                <h2 className="text-center fw-bold mb-4">Login to SkillSwap</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4 text-start">
                        <label className="form-label fw-bold">Username</label>
                        <input 
                            type="text" 
                            className="form-control form-control-lg" 
                            placeholder="Enter your username" 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="mb-4 text-start">
                        <label className="form-label fw-bold">Password</label>
                        <input 
                            type="password" 
                            className="form-control form-control-lg" 
                            placeholder="Enter your password" 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-success btn-lg w-100 fw-bold shadow-sm mb-3">
                        Login
                    </button>
                </form>
                <hr />
                <p className="text-center mb-0 text-muted">
                    Naye user ho? <button className="btn btn-link fw-bold p-0 text-decoration-none" onClick={toggleForm}>Yahan Register Karein</button>
                </p>
            </div>
        </div>
    );
};

export default Login;